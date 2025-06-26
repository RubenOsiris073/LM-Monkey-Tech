import { useState, useCallback } from 'react';
import JSZip from 'jszip';

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

interface ClassData {
  name: string;
  images: { file: File; url: string; id: string }[];
  id: string;
}

interface UseServerTrainingReturn {
  isTraining: boolean;
  trainingProgress: number;
  trainingMetrics: TrainingMetrics | null;
  error: string | null;
  startTraining: (classes: ClassData[]) => Promise<void>;
  downloadModel: (modelData: any) => void;
}

export function useServerTraining(): UseServerTrainingReturn {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convertir File a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Iniciar entrenamiento en el servidor
  const startTraining = useCallback(async (classes: ClassData[]) => {
    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingMetrics(null);
    setError(null);

    try {
      // Preparar datos para enviar al servidor
      const trainingData = {
        classes: await Promise.all(
          classes.map(async (cls) => ({
            name: cls.name,
            images: await Promise.all(
              cls.images.map(img => fileToBase64(img.file))
            )
          }))
        )
      };

      // Enviar solicitud de entrenamiento
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el entrenamiento');
      }

      const result = await response.json();
      
      // Simular progreso mientras se entrena
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 1000);

      // Limpiar intervalo cuando termine
      setTimeout(() => {
        clearInterval(progressInterval);
        setTrainingProgress(100);
        setTrainingMetrics({
          epoch: 20,
          loss: result.metrics.finalLoss,
          accuracy: result.metrics.finalAccuracy,
        });
      }, 20000); // 20 segundos de ejemplo

      return result;

    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsTraining(false);
    }
  }, []);

  // Descargar modelo entrenado
  const downloadModel = useCallback(async (modelData: any) => {
    try {
      if (!modelData) {
        alert('No hay datos del modelo para descargar.');
        return;
      }

      const modelName = modelData.metadata?.name || `grocery-model-${Date.now()}`;
      const zip = new JSZip();

      // 1. Agregar model.json (topología del modelo)
      if (modelData.modelTopology) {
        zip.file(`${modelName}-model.json`, JSON.stringify(modelData.modelTopology, null, 2));
      }

      // 2. Agregar model.weights.bin (pesos del modelo)
      if (modelData.weightsData) {
        // Convertir array de números de vuelta a ArrayBuffer
        const weightsArray = Array.isArray(modelData.weightsData) 
          ? new Uint8Array(modelData.weightsData)
          : new Uint8Array(modelData.weightsData);
        zip.file(`${modelName}-model.weights.bin`, weightsArray);
      }

      // 3. Agregar metadata.json (metadatos completos)
      if (modelData.metadata) {
        zip.file(`${modelName}-metadata.json`, JSON.stringify(modelData.metadata, null, 2));
      }

      // 4. Agregar README.txt con instrucciones
      const readmeContent = `# Modelo de Clasificación de Productos Grocery ML

Modelo entrenado: ${modelData.metadata?.name || 'Sin nombre'}
Fecha de entrenamiento: ${modelData.metadata?.createdAt || new Date().toISOString()}
Clases: ${modelData.metadata?.classes?.join(', ') || 'No especificadas'}
Precisión final: ${modelData.metadata?.finalMetrics?.accuracy ? (modelData.metadata.finalMetrics.accuracy * 100).toFixed(2) + '%' : 'No disponible'}

## Archivos incluidos:
- ${modelName}-model.json: Topología del modelo (arquitectura de la red neuronal)
- ${modelName}-model.weights.bin: Pesos entrenados del modelo (archivo binario)
- ${modelName}-metadata.json: Metadatos completos del entrenamiento

## Cómo usar:
1. Para cargar en TensorFlow.js: tf.loadLayersModel('ruta/al/${modelName}-model.json')
2. Para usar en esta aplicación: sube todos los archivos a la página de modelos
3. El modelo espera imágenes de 224x224 píxeles, normalizadas entre 0-1

## Estructura del modelo:
${modelData.metadata?.architecture || 'CNN (Convolutional Neural Network)'}
- Input: ${modelData.metadata?.inputShape?.join('x') || '224x224x3'}
- Output: ${modelData.metadata?.outputShape?.[0] || modelData.metadata?.classes?.length || 'N/A'} clases
- Parámetros entrenables: ${modelData.metadata?.modelSize ? Math.round(modelData.metadata.modelSize / 1024) + ' KB' : 'No disponible'}

## Métricas de entrenamiento:
- Épocas: ${modelData.metadata?.epochs || 20}
- Optimizador: ${modelData.metadata?.optimizer || 'adam'}
- Función de pérdida: ${modelData.metadata?.loss || 'categoricalCrossentropy'}
- Precisión final: ${modelData.metadata?.finalMetrics?.accuracy ? (modelData.metadata.finalMetrics.accuracy * 100).toFixed(2) + '%' : 'No disponible'}
- Pérdida final: ${modelData.metadata?.finalMetrics?.loss?.toFixed(4) || 'No disponible'}

## Requisitos del sistema:
- TensorFlow.js >= 4.0.0
- Navegador web moderno con soporte para WebGL (recomendado)
- Node.js (para uso en servidor)

Generado por Grocery ML Classifier - ${new Date().toLocaleString()}
`;

      zip.file(`${modelName}-README.txt`, readmeContent);

      // 5. Agregar package.json para uso en Node.js
      const packageJson = {
        name: modelName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: "1.0.0",
        description: `Modelo de clasificación de productos entrenado con Grocery ML`,
        main: `${modelName}-model.json`,
        keywords: ["tensorflow", "machine-learning", "classification", "grocery", "products"],
        dependencies: {
          "@tensorflow/tfjs": "^4.22.0",
          "@tensorflow/tfjs-node": "^4.22.0"
        },
        scripts: {
          test: "node test-model.js"
        },
        author: "Grocery ML Classifier",
        license: "MIT"
      };

      zip.file(`package.json`, JSON.stringify(packageJson, null, 2));

      // 6. Agregar script de ejemplo para probar el modelo
      const testScript = `// Script de ejemplo para probar el modelo
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

async function loadAndTestModel() {
  try {
    console.log('Cargando modelo...');
    const model = await tf.loadLayersModel('file://./${modelName}-model.json');
    
    console.log('Modelo cargado exitosamente!');
    console.log('Input shape:', model.inputs[0].shape);
    console.log('Output shape:', model.outputs[0].shape);
    
    // Crear tensor de prueba (imagen simulada)
    const testInput = tf.randomNormal([1, 224, 224, 3]);
    console.log('Realizando predicción de prueba...');
    
    const prediction = model.predict(testInput);
    console.log('Predicción completada!');
    console.log('Resultado shape:', prediction.shape);
    
    // Limpiar memoria
    testInput.dispose();
    prediction.dispose();
    
    console.log('Modelo funcionando correctamente!');
  } catch (error) {
    console.error('Error al cargar el modelo:', error);
  }
}

loadAndTestModel();
`;

      zip.file(`test-model.js`, testScript);

      // Generar y descargar el archivo ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelName}-complete.zip`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`Modelo ${modelName} descargado como archivo ZIP completo`);
      alert(`¡Modelo descargado exitosamente como ${modelName}-complete.zip!\n\nEl archivo incluye:\n- Modelo TensorFlow.js\n- Metadatos\n- Documentación\n- Scripts de ejemplo`);
      
    } catch (error) {
      console.error('Error descargando modelo:', error);
      alert('Error al descargar el modelo: ' + (error as Error).message);
    }
  }, []);

  return {
    isTraining,
    trainingProgress,
    trainingMetrics,
    error,
    startTraining,
    downloadModel,
  };
}
