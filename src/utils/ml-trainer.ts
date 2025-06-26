import * as tf from '@tensorflow/tfjs';
import { ML_CONFIG } from '../config/ml-config';

export interface TrainingData {
  images: tf.Tensor4D;
  labels: tf.Tensor2D;
}

export interface TrainingMetrics {
  loss: number;
  accuracy: number;
  epoch: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface ClassData {
  name: string;
  images: { file: File; url: string; id: string }[];
  id: string;
}

export class MLTrainer {
  private model: tf.LayersModel | null = null;
  private isTraining = false;

  constructor() {
    // Configurar TensorFlow.js
    tf.setBackend('webgl');
  }

  async createModel(numClasses: number): Promise<tf.LayersModel> {
    // Crear un modelo simple para clasificación de imágenes
    const model = tf.sequential({
      layers: [
        // Capa de entrada
        tf.layers.conv2d({
          inputShape: [ML_CONFIG.MODEL.IMAGE_SIZE, ML_CONFIG.MODEL.IMAGE_SIZE, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        // Segunda capa convolucional
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        // Tercera capa convolucional
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.globalAveragePooling2d({}),
        
        // Capa de dropout para regularización
        tf.layers.dropout({ rate: 0.5 }),
        
        // Capa de salida
        tf.layers.dense({
          units: numClasses,
          activation: 'softmax'
        })
      ]
    });

    // Compilar el modelo
    model.compile({
      optimizer: tf.train.adam(ML_CONFIG.TRAINING.DEFAULT_LEARNING_RATE),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    return model;
  }

  async preprocessImage(imageElement: HTMLImageElement): Promise<tf.Tensor3D> {
    return tf.tidy(() => {
      // Convertir imagen a tensor
      const tensor = tf.browser.fromPixels(imageElement);
      
      // Redimensionar a 224x224
      const resized = tf.image.resizeBilinear(tensor, [
        ML_CONFIG.MODEL.IMAGE_SIZE, 
        ML_CONFIG.MODEL.IMAGE_SIZE
      ]);
      
      // Normalizar valores de pixel a [0, 1]
      const normalized = resized.div(255.0);
      
      return normalized as tf.Tensor3D;
    });
  }

  async prepareTrainingData(classes: ClassData[]): Promise<TrainingData> {
    const images: tf.Tensor3D[] = [];
    const labels: number[] = [];

    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
      const classData = classes[classIndex];
      
      for (const imageData of classData.images) {
        try {
          // Crear elemento de imagen
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageData.url;
          });

          // Preprocesar imagen
          const tensor = await this.preprocessImage(img);
          images.push(tensor);
          labels.push(classIndex);
        } catch (error) {
          console.error('Error procesando imagen:', error);
        }
      }
    }

    // Convertir a tensores de entrenamiento
    const imagesTensor = tf.stack(images) as tf.Tensor4D;
    const labelsTensor = tf.oneHot(labels, classes.length) as tf.Tensor2D;

    // Limpiar tensores temporales
    images.forEach(tensor => tensor.dispose());

    return {
      images: imagesTensor,
      labels: labelsTensor
    };
  }

  async trainModel(
    classes: ClassData[],
    onProgress?: (metrics: TrainingMetrics) => void
  ): Promise<void> {
    if (this.isTraining) {
      throw new Error('El modelo ya está siendo entrenado');
    }

    this.isTraining = true;

    try {
      // Crear modelo si no existe
      if (!this.model) {
        await this.createModel(classes.length);
      }

      // Preparar datos de entrenamiento
      const trainingData = await this.prepareTrainingData(classes);

      // Entrenar modelo
      const history = await this.model!.fit(trainingData.images, trainingData.labels, {
        epochs: ML_CONFIG.TRAINING.DEFAULT_EPOCHS,
        batchSize: ML_CONFIG.TRAINING.DEFAULT_BATCH_SIZE,
        validationSplit: ML_CONFIG.TRAINING.VALIDATION_SPLIT,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (onProgress && logs) {
              onProgress({
                epoch: epoch + 1,
                loss: logs.loss,
                accuracy: logs.acc || logs.accuracy || 0,
                valLoss: logs.val_loss,
                valAccuracy: logs.val_acc || logs.val_accuracy
              });
            }
          }
        }
      });

      // Limpiar datos de entrenamiento
      trainingData.images.dispose();
      trainingData.labels.dispose();

    } finally {
      this.isTraining = false;
    }
  }

  async predict(imageElement: HTMLImageElement): Promise<{ className: string; confidence: number }[]> {
    if (!this.model) {
      throw new Error('El modelo no ha sido entrenado');
    }

    const preprocessed = await this.preprocessImage(imageElement);
    const expanded = preprocessed.expandDims(0);
    
    const predictions = this.model.predict(expanded) as tf.Tensor2D;
    const probabilities = await predictions.data();
    
    // Limpiar tensores
    preprocessed.dispose();
    expanded.dispose();
    predictions.dispose();

    return Array.from(probabilities).map((prob, index) => ({
      className: `Clase ${index + 1}`,
      confidence: prob
    })).sort((a, b) => b.confidence - a.confidence);
  }

  async saveModel(name: string): Promise<void> {
    if (!this.model) {
      throw new Error('No hay modelo para guardar');
    }

    await this.model.save(`localstorage://${name}`);
  }

  async loadModel(name: string): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`localstorage://${name}`);
    } catch (error) {
      console.error('Error cargando modelo:', error);
      throw new Error('No se pudo cargar el modelo');
    }
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}
