import { useState, useCallback } from 'react';

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
  const downloadModel = useCallback((modelData: any) => {
    try {
      if (!modelData || !modelData.files) {
        // Fallback para modelos sin estructura completa
        const blob = new Blob([JSON.stringify(modelData, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grocery-model-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      // Crear archivo ZIP con todos los componentes del modelo
      const modelName = modelData.metadata?.name || `grocery-model-${Date.now()}`;
      
      // 1. Descargar model.json (topología)
      const modelJsonBlob = new Blob([JSON.stringify(modelData.modelTopology, null, 2)], {
        type: 'application/json'
      });
      downloadFile(modelJsonBlob, `${modelName}-model.json`);

      // 2. Descargar model.weights.bin (pesos binarios)
      const weightsArray = new Uint8Array(modelData.weightsData);
      const weightsBlob = new Blob([weightsArray], {
        type: 'application/octet-stream'
      });
      downloadFile(weightsBlob, `${modelName}-model.weights.bin`);

      // 3. Descargar metadata.json (metadatos completos)
      const metadataBlob = new Blob([JSON.stringify(modelData.metadata, null, 2)], {
        type: 'application/json'
      });
      downloadFile(metadataBlob, `${modelName}-metadata.json`);

      // 4. Descargar README.txt con instrucciones
      const readmeContent = `# Modelo de Clasificación de Productos Grocery ML
      
Modelo entrenado: ${modelData.metadata?.name}
Fecha de entrenamiento: ${modelData.metadata?.createdAt}
Clases: ${modelData.metadata?.classes?.join(', ')}
Precisión final: ${(modelData.metadata?.finalMetrics?.accuracy * 100).toFixed(2)}%

## Archivos incluidos:
- ${modelName}-model.json: Topología del modelo (arquitectura de la red neuronal)
- ${modelName}-model.weights.bin: Pesos entrenados del modelo (archivo binario)
- ${modelName}-metadata.json: Metadatos completos del entrenamiento

## Cómo usar:
1. Para cargar en TensorFlow.js: tf.loadLayersModel('ruta/al/model.json')
2. Para usar en esta aplicación: sube todos los archivos a la página de modelos
3. El modelo espera imágenes de 224x224 píxeles, normalizadas entre 0-1

## Estructura del modelo:
${JSON.stringify(modelData.modelTopology.modelTopology.config.layers.map((layer: any) => ({
  type: layer.class_name,
  name: layer.config.name
})), null, 2)}
`;

      const readmeBlob = new Blob([readmeContent], {
        type: 'text/plain'
      });
      downloadFile(readmeBlob, `${modelName}-README.txt`);

      console.log(`Modelo ${modelName} descargado con ${Object.keys(modelData.files).length} archivos`);
      
    } catch (error) {
      console.error('Error descargando modelo:', error);
      // Fallback para descarga simple
      const blob = new Blob([JSON.stringify(modelData, null, 2)], {
        type: 'application/json'
      });
      downloadFile(blob, `grocery-model-${Date.now()}.json`);
    }
  }, []);

  // Función auxiliar para descargar archivos
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    isTraining,
    trainingProgress,
    trainingMetrics,
    error,
    startTraining,
    downloadModel,
  };
}
