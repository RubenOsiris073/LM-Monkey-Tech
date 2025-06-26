'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Plus, 
  X, 
  Play, 
  Download, 
  BarChart3,
  Trash2,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { ML_CONFIG } from '@/src/config/ml-config';
import { useServerTraining } from '@/src/hooks/useServerTraining';

interface ImageData {
  file: File;
  url: string;
  id: string;
}

interface ClassData {
  name: string;
  images: ImageData[];
  id: string;
}

export default function TrainPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [newClassName, setNewClassName] = useState('');
  
  // Usar el hook para entrenamiento en servidor
  const {
    isTraining,
    trainingProgress,
    trainingMetrics,
    error,
    startTraining,
    downloadModel
  } = useServerTraining();

  // Agregar nueva clase
  const addClass = () => {
    if (newClassName.trim() && classes.length < ML_CONFIG.MODEL.MAX_CLASSES) {
      const newClass: ClassData = {
        name: newClassName.trim(),
        images: [],
        id: Math.random().toString(36).substr(2, 9)
      };
      setClasses([...classes, newClass]);
      setNewClassName('');
    }
  };

  // Eliminar clase
  const removeClass = (classId: string) => {
    setClasses(classes.filter(cls => cls.id !== classId));
  };

  // Manejar subida de imágenes
  const handleImageUpload = useCallback((classId: string, files: FileList) => {
    const newImages: ImageData[] = [];
    
    Array.from(files).forEach(file => {
      if (ML_CONFIG.UI.ACCEPTED_FORMATS.includes(file.type) && 
          file.size <= ML_CONFIG.UI.MAX_FILE_SIZE) {
        const imageData: ImageData = {
          file,
          url: URL.createObjectURL(file),
          id: Math.random().toString(36).substr(2, 9)
        };
        newImages.push(imageData);
      }
    });

    setClasses(prevClasses =>
      prevClasses.map(cls =>
        cls.id === classId 
          ? { ...cls, images: [...cls.images, ...newImages] }
          : cls
      )
    );
  }, []);

  // Eliminar imagen
  const removeImage = (classId: string, imageId: string) => {
    setClasses(prevClasses =>
      prevClasses.map(cls =>
        cls.id === classId
          ? { 
              ...cls, 
              images: cls.images.filter(img => {
                if (img.id === imageId) {
                  URL.revokeObjectURL(img.url);
                  return false;
                }
                return true;
              })
            }
          : cls
      )
    );
  };

  // Validar datos de entrenamiento
  const validateTrainingData = () => {
    if (classes.length < 2) {
      return { valid: false, message: 'Se necesitan al menos 2 clases para entrenar' };
    }
    
    for (const cls of classes) {
      if (cls.images.length < ML_CONFIG.MODEL.MIN_IMAGES_PER_CLASS) {
        return { 
          valid: false, 
          message: `La clase "${cls.name}" necesita al menos ${ML_CONFIG.MODEL.MIN_IMAGES_PER_CLASS} imágenes` 
        };
      }
    }
    
    return { valid: true, message: '' };
  };

  // Iniciar entrenamiento en servidor
  const handleStartTraining = async () => {
    const validation = validateTrainingData();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    try {
      await startTraining(classes);
      alert('¡Entrenamiento completado exitosamente!');
    } catch (error) {
      console.error('Error durante el entrenamiento:', error);
      alert('Error durante el entrenamiento: ' + (error as Error).message);
    }
  };

  // Descargar modelo - usar función del hook
  const handleDownloadModel = () => {
    if (!trainingMetrics) {
      alert('No hay modelo entrenado para descargar');
      return;
    }
    
    // Crear datos de modelo simulados para descarga
    const modelData = {
      metadata: {
        name: `grocery-model-${Date.now()}`,
        classes: classes.map(c => c.name),
        createdAt: new Date().toISOString(),
        accuracy: trainingMetrics.accuracy
      },
      // Aquí irían los datos reales del modelo del servidor
    };
    
    downloadModel(modelData);
  };

  const totalImages = classes.reduce((sum, cls) => sum + cls.images.length, 0);

  return (
    <div className="bg-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Entrenar Modelo</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="badge-primary">
              {classes.length} clases • {totalImages} imágenes
            </div>
            {!isTraining && classes.length > 0 && (
              <button
                onClick={handleDownloadModel}
                className="btn-success"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Modelo</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo - Gestión de clases */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agregar nueva clase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-primary"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Agregar Nueva Clase</h2>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Nombre de la clase (ej: Manzanas)"
                  className="input-primary flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addClass()}
                />
                <button
                  onClick={addClass}
                  disabled={!newClassName.trim() || classes.length >= ML_CONFIG.MODEL.MAX_CLASSES}
                  className="btn-info"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>
              {classes.length >= ML_CONFIG.MODEL.MAX_CLASSES && (
                <p className="text-sm text-amber-600 mt-2">
                  Máximo {ML_CONFIG.MODEL.MAX_CLASSES} clases permitidas
                </p>
              )}
            </motion.div>

            {/* Lista de clases */}
            <div className="space-y-4">
              {classes.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <h3 className="text-lg font-medium text-gray-800">{cls.name}</h3>
                      <span className="text-sm text-gray-500">
                        {cls.images.length} imagen{cls.images.length !== 1 ? 'es' : ''}
                      </span>
                      {cls.images.length < ML_CONFIG.MODEL.MIN_IMAGES_PER_CLASS && (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <button
                      onClick={() => removeClass(cls.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Zona de subida */}
                  <div className="upload-zone mb-4">
                    <input
                      type="file"
                      multiple
                      accept={ML_CONFIG.UI.ACCEPTED_FORMATS.join(',')}
                      onChange={(e) => e.target.files && handleImageUpload(cls.id, e.target.files)}
                      className="hidden"
                      id={`upload-${cls.id}`}
                    />
                    <label
                      htmlFor={`upload-${cls.id}`}
                      className="flex flex-col items-center justify-center cursor-pointer p-6 rounded-3xl transition-colors"
                    >
                      <div className="icon-gradient mb-4">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-lg font-semibold text-gray-700 mb-2">
                        Arrastra imágenes aquí o haz clic para seleccionar
                      </span>
                      <span className="text-sm text-gray-500">
                        PNG, JPG, WEBP hasta 10MB
                      </span>
                    </label>
                  </div>

                  {/* Grid de imágenes */}
                  {cls.images.length > 0 && (
                    <div className="grid grid-cols-6 gap-3">
                      {cls.images.map((img) => (
                        <div
                          key={img.id}
                          className="relative group aspect-square"
                        >
                          <img
                            src={img.url}
                            alt={`${cls.name} - ${img.id}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(cls.id, img.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Panel derecho - Control de entrenamiento */}
          <div className="space-y-6">
            {/* Estado del entrenamiento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado del Modelo</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Clases definidas:</span>
                  <span className="font-semibold text-gray-900">{classes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total de imágenes:</span>
                  <span className="font-semibold text-gray-900">{totalImages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                  <span className={`font-semibold ${isTraining ? 'text-blue-600' : 'text-green-600'}`}>
                    {isTraining ? 'Entrenando...' : 'Listo'}
                  </span>
                </div>
              </div>

              {isTraining && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Progreso</span>
                    <span className="text-blue-600">{Math.round(trainingProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleStartTraining}
                disabled={isTraining || !validateTrainingData().valid}
                className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{isTraining ? 'Entrenando...' : 'Iniciar Entrenamiento'}</span>
              </button>

              {!validateTrainingData().valid && (
                <p className="text-xs text-red-600 mt-2">
                  {validateTrainingData().message}
                </p>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ❌ Error: {error}
                  </p>
                </div>
              )}
              
              {isTraining && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    🚀 Entrenando en el servidor... El modelo se está procesando en la nube.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Métricas de entrenamiento */}
            {trainingMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Métricas</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Época:</span>
                    <span className="font-semibold text-gray-900">{trainingMetrics.epoch}/{ML_CONFIG.TRAINING.DEFAULT_EPOCHS}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Pérdida:</span>
                    <span className="font-semibold text-gray-900">{trainingMetrics.loss.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Precisión:</span>
                    <span className="font-semibold text-green-600">{(trainingMetrics.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  {trainingMetrics.valAccuracy && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Precisión Val:</span>
                      <span className="font-semibold text-blue-600">{(trainingMetrics.valAccuracy * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
