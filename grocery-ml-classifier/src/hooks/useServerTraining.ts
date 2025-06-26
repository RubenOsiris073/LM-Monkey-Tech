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
    } catch (error) {
      console.error('Error descargando modelo:', error);
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
