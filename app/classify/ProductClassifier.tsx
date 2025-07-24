'use client';

import { useState, useCallback } from 'react';
import { ML_CONFIG } from '@/src/config/ml-config';
import { uploadFileInChunks } from '@/src/utils/modelSplitter';
import ClassifyHeader from './layout/ClassifyHeader';
import ContentTitle from './layout/ContentTitle';
import ModelLoader from './components/ModelLoader';
import ImageUploader from './components/ImageUploader';
import ClassificationResults from './components/ClassificationResults';

interface Prediction {
  className: string;
  confidence: number;
}

interface ModelFiles {
  modelJson: File | null;
  weightsFile: File | null;
  metadataJson: File | null;
}

interface ModelMetadata {
  modelName?: string;
  name?: string;
  labels: string[]; // Array de nombres de clases - REQUERIDO
  classes?: string[]; // Compatibilidad adicional
  classLabels?: { id: number; name: string }[];
  numClasses?: number;
  inputShape?: number[];
  outputShape?: number[];
  architecture?: string;
  framework?: string;
  version?: string;
  createdAt?: string;
  finalMetrics?: {
    accuracy?: number;
    loss?: number;
  };
}

export default function AIProductClassifierPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelFiles, setModelFiles] = useState<ModelFiles>({
    modelJson: null,
    weightsFile: null,
    metadataJson: null
  });
  const [modelMetadata, setModelMetadata] = useState<ModelMetadata | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  // Manejar selección de archivos del modelo
  const handleModelFileSelect = (type: keyof ModelFiles, file: File) => {
    setModelFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  // Cargar y validar el modelo personalizado
  const loadCustomModel = async () => {
    const { modelJson, weightsFile, metadataJson } = modelFiles;
    
    if (!modelJson || !weightsFile || !metadataJson) {
      alert('Por favor selecciona los 3 archivos requeridos: model.json, model.weights.bin y metadata.json');
      return;
    }

    setIsLoadingModel(true);
    
    try {
      // Leer y validar el archivo metadata.json
      const metadataText = await metadataJson.text();
      console.log('Metadata text content:', metadataText);
      const metadata: ModelMetadata = JSON.parse(metadataText);
      console.log('Parsed metadata:', metadata);
      console.log('Metadata labels:', metadata.labels);
      console.log('Metadata classes:', metadata.classes);
      console.log('Is labels array?', Array.isArray(metadata.labels));
      console.log('Is classes array?', Array.isArray(metadata.classes));
      
      // Verificar si tiene labels o classes válidos
      let validLabels: string[] | null = null;
      
      if (metadata.labels && Array.isArray(metadata.labels) && metadata.labels.length > 0) {
        validLabels = metadata.labels;
        console.log('Usando metadata.labels:', validLabels);
      } else if (metadata.classes && Array.isArray(metadata.classes) && metadata.classes.length > 0) {
        validLabels = metadata.classes;
        console.log('Usando metadata.classes:', validLabels);
        // Asignar a labels para compatibilidad
        metadata.labels = metadata.classes;
      } else {
        console.error('Validation failed - no valid labels found:', {
          hasLabels: !!metadata.labels,
          hasClasses: !!metadata.classes,
          labelsIsArray: Array.isArray(metadata.labels),
          classesIsArray: Array.isArray(metadata.classes),
          labelsLength: metadata.labels?.length,
          classesLength: metadata.classes?.length,
          fullMetadata: metadata
        });
        throw new Error('El archivo metadata.json debe contener un array de labels o classes válido');
      }

      // Leer el archivo model.json para validación
      const modelJsonText = await modelJson.text();
      const modelConfig = JSON.parse(modelJsonText);
      
      if (!modelConfig.modelTopology) {
        throw new Error('El archivo model.json no tiene una estructura válida de TensorFlow.js');
      }

      // Validar que el archivo de pesos existe y tiene el tamaño correcto
      if (weightsFile.size === 0) {
        throw new Error('El archivo de pesos está vacío');
      }

      setModelMetadata(metadata);
      setModelLoaded(true);
      alert(`Modelo "${metadata.modelName || metadata.name || 'Custom Model'}" cargado exitosamente con ${metadata.labels.length} clases: ${metadata.labels.join(', ')}`);
      
    } catch (error) {
      console.error('Error cargando modelo personalizado:', error);
      alert('Error al cargar el modelo: ' + (error as Error).message);
    } finally {
      setIsLoadingModel(false);
    }
  };

  // Resetear modelo cargado
  const resetModel = () => {
    setModelFiles({
      modelJson: null,
      weightsFile: null,
      metadataJson: null
    });
    setModelMetadata(null);
    setModelLoaded(false);
    setPredictions([]);
  };

  // Manejar selección de imagen y convertir a base64
  const handleImageSelect = async (file: File) => {
    if (ML_CONFIG.UI.ACCEPTED_FORMATS.includes(file.type) && 
        file.size <= ML_CONFIG.UI.MAX_FILE_SIZE) {
      
      // Convertir a base64 para enviar al servidor
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setSelectedImage(base64);
        setPredictions([]);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Formato de archivo no válido o archivo demasiado grande');
    }
  };

  // Clasificar imagen usando el modelo personalizado cargado
  const uploadModel = useCallback(async () => {
    if (!modelFiles.modelJson || !modelFiles.weightsFile || !modelFiles.metadataJson) {
      throw new Error('Faltan archivos del modelo');
    }

    const sessionId = Math.random().toString(36).substr(2, 9);
    const metadata = { sessionId };

    // Subir cada archivo por separado
    const [modelJsonUrls, weightsUrls, metadataUrls] = await Promise.all([
      uploadFileInChunks(modelFiles.modelJson, '/api/upload-model', { ...metadata, type: 'model' }),
      uploadFileInChunks(modelFiles.weightsFile, '/api/upload-model', { ...metadata, type: 'weights' }),
      uploadFileInChunks(modelFiles.metadataJson, '/api/upload-model', { ...metadata, type: 'metadata' })
    ]);

    return {
      sessionId,
      modelJsonUrls,
      weightsUrls,
      metadataUrls
    };
  }, [modelFiles]);

  const classifyImage = async () => {
    if (!selectedImage) {
      alert('Selecciona una imagen primero');
      return;
    }

    if (!modelLoaded || !modelMetadata) {
      alert('Primero carga un modelo válido');
      return;
    }

    setIsClassifying(true);
    
    try {
      // Primero subir los archivos del modelo
      console.log('Subiendo archivos del modelo...');
      const uploadedFiles = await uploadModel();

      // Crear FormData con referencias a los archivos subidos
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('sessionId', uploadedFiles.sessionId);
      formData.append('modelInfo', JSON.stringify(uploadedFiles));

      // Enviar al servidor para clasificación
      const response = await fetch('/api/classify', {
        method: 'POST',
        body: formData,
      });

      let errorData;
      let responseText;
      
      try {
        responseText = await response.text();
        const result = JSON.parse(responseText);
        
        if (!response.ok) {
          throw new Error(result.error || 'Error en la clasificación');
        }

        setPredictions(result.predictions.slice(0, ML_CONFIG.METRICS.TOP_K_PREDICTIONS));
      } catch (parseError) {
        console.error('Error al procesar la respuesta:', responseText);
        throw new Error('Error al procesar la respuesta del servidor');
      }
      
    } catch (error) {
      console.error('Error durante la clasificación:', error);
      alert('Error durante la clasificación: ' + (error as Error).message);
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-classify">
      <div className="container mx-auto px-4 py-8">
        <ClassifyHeader />
        <ContentTitle />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo - Carga del modelo */}
          <div className="space-y-6">
            <ModelLoader
              modelFiles={modelFiles}
              modelMetadata={modelMetadata}
              modelLoaded={modelLoaded}
              isLoadingModel={isLoadingModel}
              onModelFileSelect={handleModelFileSelect}
              onLoadModel={loadCustomModel}
              onResetModel={resetModel}
            />
          </div>

          {/* Panel central - Subida y visualización de imagen */}
          <div className="space-y-6">
            <ImageUploader
              selectedImage={selectedImage}
              isClassifying={isClassifying}
              modelLoaded={modelLoaded}
              onImageSelect={handleImageSelect}
              onClassifyImage={classifyImage}
            />
          </div>

          {/* Panel derecho - Resultados */}
          <div className="space-y-6">
            <ClassificationResults
              predictions={predictions}
              isClassifying={isClassifying}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
