import { useState, useCallback } from 'react';

export interface UploadProgress {
  className: string;
  total: number;
  uploaded: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export const useImageUploader = () => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  const uploadBatchWithRetry = async (
    className: string,
    batch: string[],
    sessionId: string,
    batchNumber: number,
    maxRetries = 3,
    delay = 1000
  ) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            className,
            images: batch,
            sessionId
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Error HTTP ${response.status}: ${errorData.error || response.statusText}`
          );
        }

        return await response.json();
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(`Error al subir lote ${batchNumber} después de ${maxRetries} intentos: ${error instanceof Error ? error.message : String(error)}`);
        }
        console.warn(`Intento ${attempt} fallido para lote ${batchNumber}, reintentando...`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  };

  const uploadClassImages = useCallback(async (
    className: string,
    images: string[],
    sessionId: string,
    batchSize = 2
  ) => {
    // Inicializar progreso
    setUploadProgress(prev => ({
      ...prev,
      [className]: {
        className,
        total: images.length,
        uploaded: 0,
        status: 'uploading'
      }
    }));

    try {
      // Subir imágenes en lotes
      for (let i = 0; i < images.length; i += batchSize) {
        const batch = images.slice(i, Math.min(i + batchSize, images.length));
        const batchNumber = Math.floor(i / batchSize) + 1;
        
        await uploadBatchWithRetry(className, batch, sessionId, batchNumber);

        // Actualizar progreso
        setUploadProgress(prev => ({
          ...prev,
          [className]: {
            ...prev[className],
            uploaded: Math.min(i + batchSize, images.length)
          }
        }));
      }

      // Marcar como completado
      setUploadProgress(prev => ({
        ...prev,
        [className]: {
          ...prev[className],
          status: 'completed'
        }
      }));

    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [className]: {
          ...prev[className],
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      }));
      throw error;
    }
  }, []);

  const uploadAllClassImages = useCallback(async (
    classes: { name: string; images: string[] }[],
    sessionId: string
  ) => {
    const results = [];
    const errors = [];

    // Subir las clases en serie para evitar sobrecargar el servidor
    for (const cls of classes) {
      try {
        await uploadClassImages(cls.name, cls.images, sessionId);
        results.push(cls.name);
      } catch (error) {
        console.error(`Error al subir la clase ${cls.name}:`, error);
        errors.push({
          className: cls.name,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    if (errors.length > 0) {
      console.error('Errores durante la subida:', errors);
      const failedClasses = errors.map(e => e.className).join(', ');
      throw new Error(`Error al subir las clases: ${failedClasses}`);
    }

    return true;
  }, [uploadClassImages]);

  return {
    uploadProgress,
    uploadClassImages,
    uploadAllClassImages
  };
};
