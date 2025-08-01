'use client';

import { useState, useCallback } from 'react';
import { ML_CONFIG } from '@/src/config/ml-config';
import { useServerTraining } from '@/src/hooks/useServerTraining';
import { useImageUploader } from '@/src/hooks/useImageUploader';
import { ImageData, ClassData } from './types';
import { TrainingClass } from '@/src/hooks/useServerTraining';
import { compressImage } from '@/src/utils/imageCompressor';

import TrainingHeader from './components/TrainingHeader';
import ContentTitle from './components/ContentTitle';
import AddClassSection from './components/AddClassSection';
import ClassCard from './components/ClassCard';
import TrainingStatus from './components/TrainingStatus';
import TrainingMetrics from './components/TrainingMetrics';

export default function ModelTrainer() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [trainedModel, setTrainedModel] = useState<any>(null);
  
  // Usar el hook para entrenamiento en servidor
  const {
    isTraining,
    trainingMetrics,
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
          id: Math.random().toString(36).substr(2, 9),
          data: URL.createObjectURL(file) // Mantener blob URL por ahora, se convierte a base64 al entrenar
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

  // Función auxiliar para convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

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
  const { uploadProgress, uploadAllClassImages } = useImageUploader();
  const sessionId = useCallback(() => Math.random().toString(36).substr(2, 9), [])();

  const handleStartTraining = async () => {
    const validation = validateTrainingData();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    try {
      console.log('🔄 Iniciando proceso de subida de imágenes...');
      
      // Convertir y comprimir todas las imágenes a base64
      const classesWithBase64 = await Promise.all(
        classes.map(async (cls) => {
          console.log(`Procesando clase "${cls.name}" con ${cls.images.length} imágenes...`);
          
          const base64Images = await Promise.all(
            cls.images.map(async (img, index) => {
              try {
                let base64;
                if (typeof img.data === 'string' && img.data.startsWith('data:image')) {
                  console.log(`[${cls.name}] Imagen ${index + 1}: usando base64 existente`);
                  base64 = img.data;
                } else {
                  console.log(`[${cls.name}] Imagen ${index + 1}: convirtiendo a base64...`);
                  base64 = await fileToBase64(img.file);
                }
                
                // Comprimir imagen
                console.log(`[${cls.name}] Imagen ${index + 1}: comprimiendo...`);
                const compressed = await compressImage(base64);
                return compressed;
              } catch (error) {
                console.error(`Error procesando imagen ${index + 1} de la clase "${cls.name}":`, error);
                throw error;
              }
            })
          );
          
          return {
            name: cls.name,
            images: base64Images
          };
        })
      );

      // Subir imágenes por lotes
      console.log('📤 Subiendo imágenes al servidor...');
      const uploadSuccess = await uploadAllClassImages(classesWithBase64, sessionId);

      if (!uploadSuccess) {
        throw new Error('Error al subir las imágenes');
      }

      // Preparar datos para entrenamiento
      const trainingClasses: TrainingClass[] = classesWithBase64.map(cls => ({
        id: classes.find(c => c.name === cls.name)?.id || Math.random().toString(36).substr(2, 9),
        name: cls.name,
        images: cls.images
      }));

      console.log(`📤 Iniciando entrenamiento con ${trainingClasses.length} clases...`);
      
      const result = await startTraining(
        trainingClasses,
        `grocery-model-${Date.now()}`,
        ML_CONFIG.TRAINING.DEFAULT_EPOCHS
      );
      if (result) {
        setTrainedModel(result);
        alert('¡Entrenamiento completado exitosamente!');
      }
    } catch (error) {
      console.error('Error durante el entrenamiento:', error);
      alert('Error durante el entrenamiento: ' + (error as Error).message);
    }
  };

  // Descargar modelo
  const handleDownloadModel = () => {
    if (!trainedModel) {
      alert('No hay modelo entrenado para descargar. Primero debes entrenar un modelo.');
      return;
    }
    
    downloadModel(trainedModel);
  };

  const totalImages = classes.reduce((sum, cls) => sum + cls.images.length, 0);

  return (
    <div className="min-h-screen bg-train">
      <div className="container mx-auto px-4 py-8">
        <TrainingHeader
          classes={classes}
          totalImages={totalImages}
          trainedModel={trainedModel}
          onDownloadModel={handleDownloadModel}
          isTraining={isTraining}
        />

        <ContentTitle />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo - Gestión de clases */}
          <div className="lg:col-span-2 space-y-6">
            <AddClassSection
              newClassName={newClassName}
              setNewClassName={setNewClassName}
              addClass={addClass}
              classCount={classes.length}
            />

            {/* Lista de clases */}
            <div className="space-y-4">
              {classes.map((cls, index) => (
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  index={index}
                  onRemoveClass={removeClass}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={removeImage}
                />
              ))}
            </div>
          </div>

          {/* Panel derecho - Control de entrenamiento */}
          <div className="space-y-6">
            <TrainingStatus
              classes={classes}
              totalImages={totalImages}
              isTraining={isTraining}
              trainingMetrics={trainingMetrics}
              onStartTraining={handleStartTraining}
              validateTrainingData={validateTrainingData}
            />

            <TrainingMetrics trainingMetrics={trainingMetrics} />
          </div>
        </div>
      </div>
    </div>
  );
}
