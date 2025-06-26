'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Camera, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Target,
  FolderOpen,
  FileText,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { ML_CONFIG } from '@/src/config/ml-config';

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

export default function ClassifyPage() {
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const modelJsonRef = useRef<HTMLInputElement>(null);
  const weightsRef = useRef<HTMLInputElement>(null);
  const metadataRef = useRef<HTMLInputElement>(null);

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
      // Crear FormData para enviar los archivos del modelo y la imagen
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('modelJson', modelFiles.modelJson!);
      formData.append('weightsFile', modelFiles.weightsFile!);
      formData.append('metadataJson', modelFiles.metadataJson!);

      // Enviar al servidor para clasificación
      const response = await fetch('/api/classify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la clasificación');
      }

      const result = await response.json();
      setPredictions(result.predictions.slice(0, ML_CONFIG.METRICS.TOP_K_PREDICTIONS));
      
    } catch (error) {
      console.error('Error durante la clasificación:', error);
      alert('Error durante la clasificación: ' + (error as Error).message);
    } finally {
      setIsClassifying(false);
    }
  };

  // Obtener color según confianza
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-classify">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <h1 className="text-3xl font-bold text-gray-800">Clasificar Productos</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span>Listo para clasificar</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo - Carga del modelo */}
          <div className="space-y-6">
            {/* Carga de modelo personalizado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-primary"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Cargar Modelo</span>
              </h2>
              
              {!modelLoaded ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Carga los 3 archivos esenciales de tu modelo entrenado:
                  </p>
                  
                  {/* model.json */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1. model.json
                    </label>
                    <input
                      ref={modelJsonRef}
                      type="file"
                      accept=".json"
                      onChange={(e) => e.target.files?.[0] && handleModelFileSelect('modelJson', e.target.files[0])}
                      className="input-primary"
                    />
                    {modelFiles.modelJson && (
                      <p className="text-xs text-green-600 mt-1">✓ {modelFiles.modelJson.name}</p>
                    )}
                  </div>

                  {/* model.weights.bin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2. model.weights.bin
                    </label>
                    <input
                      ref={weightsRef}
                      type="file"
                      accept=".bin"
                      onChange={(e) => e.target.files?.[0] && handleModelFileSelect('weightsFile', e.target.files[0])}
                      className="input-primary"
                    />
                    {modelFiles.weightsFile && (
                      <p className="text-xs text-green-600 mt-1">✓ {modelFiles.weightsFile.name}</p>
                    )}
                  </div>

                  {/* metadata.json */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3. metadata.json
                    </label>
                    <input
                      ref={metadataRef}
                      type="file"
                      accept=".json"
                      onChange={(e) => e.target.files?.[0] && handleModelFileSelect('metadataJson', e.target.files[0])}
                      className="input-primary"
                    />
                    {modelFiles.metadataJson && (
                      <p className="text-xs text-green-600 mt-1">✓ {modelFiles.metadataJson.name}</p>
                    )}
                  </div>

                  <button
                    onClick={loadCustomModel}
                    disabled={!modelFiles.modelJson || !modelFiles.weightsFile || !modelFiles.metadataJson || isLoadingModel}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingModel ? 'Cargando modelo...' : 'Cargar Modelo'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Modelo cargado</span>
                  </div>
                  
                  {modelMetadata && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>Nombre:</strong> {modelMetadata.modelName || 'Modelo personalizado'}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Clases:</strong> {modelMetadata.labels.length}
                      </p>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {modelMetadata.labels.slice(0, 3).map((label, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                              {label}
                            </span>
                          ))}
                          {modelMetadata.labels.length > 3 && (
                            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                              +{modelMetadata.labels.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={resetModel}
                    className="btn-secondary w-full"
                  >
                    Cargar otro modelo
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Panel central - Subida y visualización de imagen */}
          <div className="space-y-6">
            {/* Zona de subida */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-primary"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Seleccionar Imagen</h2>
              
              {!selectedImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ML_CONFIG.UI.ACCEPTED_FORMATS.join(',')}
                    onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 p-8 rounded-lg transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-lg text-gray-600 mb-2">
                      Sube una imagen de producto
                    </span>
                    <span className="text-sm text-gray-400">
                      PNG, JPG, WEBP hasta 10MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      ref={imageRef}
                      src={selectedImage}
                      alt="Imagen a clasificar"
                      className="w-full h-64 object-cover rounded-lg"
                      crossOrigin="anonymous"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Cambiar imagen</span>
                    </button>
                    
                    <button
                      onClick={classifyImage}
                      disabled={!selectedImage || isClassifying || !modelLoaded}
                      className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Target className="w-4 h-4" />
                      <span>
                        {isClassifying ? 'Clasificando...' : !modelLoaded ? 'Carga un modelo primero' : 'Clasificar'}
                      </span>
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ML_CONFIG.UI.ACCEPTED_FORMATS.join(',')}
                    onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}
            </motion.div>


          </div>

          {/* Panel derecho - Resultados */}
          <div className="space-y-6">
            {/* Resultados de clasificación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-primary"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados</h2>
              
              {isClassifying ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Analizando imagen...</span>
                </div>
              ) : predictions.length > 0 ? (
                <div className="space-y-3">
                  {predictions.map((prediction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">
                          {prediction.className}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                          {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${prediction.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Sube una imagen y haz clic en "Clasificar" para ver los resultados</p>
                </div>
              )}
            </motion.div>

            {/* Información de confianza */}
            {predictions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-warning"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Interpretación</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">
                      <strong>Alta confianza (≥80%)</strong>: Predicción muy confiable
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">
                      <strong>Media confianza (60-79%)</strong>: Predicción moderadamente confiable
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">
                      <strong>Baja confianza (&lt;60%)</strong>: Predicción poco confiable
                    </span>
                  </div>
                </div>
                
                {predictions[0] && predictions[0].confidence < ML_CONFIG.METRICS.CONFIDENCE_THRESHOLD && (                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    La confianza es baja. Considera entrenar el modelo con más datos o verificar que la imagen sea clara y esté bien iluminada.
                  </p>
                </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
