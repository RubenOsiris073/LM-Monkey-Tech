import * as tf from '@tensorflow/tfjs';
import { ML_CONFIG } from '@/config/ml-config';

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface ClassData {
  name: string;
  images: { file: File; url: string; id: string }[];
  id: string;
}

export class SimpleMLTrainer {
  private model: tf.LayersModel | null = null;
  private classes: string[] = [];

  /**
   * Convierte una imagen a tensor
   */
  private async imageToTensor(imageSrc: string): Promise<tf.Tensor3D> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([ML_CONFIG.MODEL.IMAGE_SIZE, ML_CONFIG.MODEL.IMAGE_SIZE])
          .toFloat()
          .div(255.0);
        resolve(tensor as tf.Tensor3D);
      };
      img.src = imageSrc;
    });
  }

  /**
   * Crea un modelo simple para clasificación
   */
  createSimpleModel(numClasses: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [ML_CONFIG.MODEL.IMAGE_SIZE, ML_CONFIG.MODEL.IMAGE_SIZE, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: numClasses, activation: 'softmax' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    return model;
  }

  /**
   * Prepara los datos de entrenamiento de forma simple
   */
  async prepareData(classesData: ClassData[]): Promise<{ xs: tf.Tensor4D; ys: tf.Tensor2D; classNames: string[] }> {
    const images: tf.Tensor3D[] = [];
    const labels: number[] = [];
    const classNames: string[] = [];

    // Extraer nombres de clases
    classesData.forEach((classData) => {
      if (!classNames.includes(classData.name)) {
        classNames.push(classData.name);
      }
    });

    this.classes = classNames;

    // Procesar imágenes
    for (const classData of classesData) {
      const classIndex = classNames.indexOf(classData.name);
      
      for (const imageData of classData.images) {
        try {
          const tensor = await this.imageToTensor(imageData.url);
          images.push(tensor);
          labels.push(classIndex);
        } catch (error) {
          console.warn('Error procesando imagen:', error);
        }
      }
    }

    if (images.length === 0) {
      throw new Error('No se pudieron procesar las imágenes');
    }

    // Convertir a tensores
    const xs = tf.stack(images);
    const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), classNames.length);

    // Limpiar tensores individuales
    images.forEach(img => img.dispose());

    return { xs: xs as tf.Tensor4D, ys: ys as tf.Tensor2D, classNames };
  }

  /**
   * Entrena el modelo de forma simple
   */
  async trainModel(
    classesData: ClassData[],
    onProgress?: (metrics: TrainingMetrics) => void
  ): Promise<void> {
    // Preparar datos
    const { xs, ys, classNames } = await this.prepareData(classesData);
    
    // Crear modelo si no existe
    if (!this.model) {
      this.createSimpleModel(classNames.length);
    }

    if (!this.model) {
      throw new Error('Error creando el modelo');
    }

    // Entrenar con callbacks simples
    await this.model.fit(xs, ys, {
      epochs: 10, // Menos épocas para pruebas rápidas
      batchSize: Math.min(8, xs.shape[0]),
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onProgress && logs) {
            const metrics: TrainingMetrics = {
              epoch: epoch + 1,
              loss: logs.loss as number,
              accuracy: logs.acc as number,
              valLoss: logs.val_loss as number,
              valAccuracy: logs.val_acc as number
            };
            onProgress(metrics);
          }
        }
      }
    });

    // Limpiar
    xs.dispose();
    ys.dispose();
  }

  /**
   * Hace predicciones
   */
  async predict(imageSrc: string): Promise<{ className: string; confidence: number }[]> {
    if (!this.model) {
      throw new Error('Modelo no entrenado');
    }

    const tensor = await this.imageToTensor(imageSrc);
    const prediction = this.model.predict(tensor.expandDims(0)) as tf.Tensor;
    const probabilities = await prediction.data();
    
    tensor.dispose();
    prediction.dispose();

    // Obtener las mejores predicciones
    const results = Array.from(probabilities)
      .map((prob, index) => ({
        className: this.classes[index] || `Clase ${index}`,
        confidence: prob
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return results;
  }

  /**
   * Guarda el modelo
   */
  async saveModel(name: string): Promise<void> {
    if (!this.model) {
      throw new Error('No hay modelo para guardar');
    }

    await this.model.save(`localstorage://${name}`);
    localStorage.setItem(`${name}_classes`, JSON.stringify(this.classes));
  }

  /**
   * Carga un modelo
   */
  async loadModel(name: string): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`localstorage://${name}`);
      const classesData = localStorage.getItem(`${name}_classes`);
      if (classesData) {
        this.classes = JSON.parse(classesData);
      }
    } catch (error) {
      throw new Error(`Error cargando modelo: ${error}`);
    }
  }

  /**
   * Obtiene información del modelo
   */
  getModelInfo(): { classes: string[]; totalParams: number } | null {
    if (!this.model) return null;

    return {
      classes: this.classes,
      totalParams: this.model.countParams()
    };
  }

  /**
   * Lista modelos guardados
   */
  getAvailableModels(): string[] {
    const models: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tensorflowjs_models/')) {
        const modelName = key.replace('tensorflowjs_models/', '').replace('/model_topology', '');
        if (!models.includes(modelName)) {
          models.push(modelName);
        }
      }
    }
    return models;
  }
}
