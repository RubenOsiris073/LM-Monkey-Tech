import * as tf from '@tensorflow/tfjs';
import { ML_CONFIG, TF_CONFIG, TrainingData, TrainingMetrics } from '@/config/ml-config';

export class MLTrainer {
  private model: tf.LayersModel | null = null;
  private classes: string[] = [];

  constructor() {
    // Configurar TensorFlow.js
    tf.setBackend(TF_CONFIG.BACKEND);
  }

  /**
   * Prepara los datos de entrenamiento
   */
  async prepareTrainingData(classesData: any[]): Promise<TrainingData> {
    const images: tf.Tensor4D[] = [];
    const labels: number[] = [];
    const classNames: string[] = [];

    // Extraer nombres de clases
    classesData.forEach((classData, index) => {
      if (!classNames.includes(classData.name)) {
        classNames.push(classData.name);
      }
    });

    this.classes = classNames;

    // Procesar imágenes
    for (let i = 0; i < classesData.length; i++) {
      const classData = classesData[i];
      const classIndex = classNames.indexOf(classData.name);

      for (const imageData of classData.images) {
        const tensor = await this.imageToTensor(imageData.url);
        images.push(tensor);
        labels.push(classIndex);
      }
    }

    // Convertir a tensores
    const xs = tf.stack(images);
    const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), classNames.length);

    // Limpiar tensores individuales
    images.forEach(img => img.dispose());

    return {
      images: xs as tf.Tensor4D,
      labels: ys as tf.Tensor2D,
      classNames
    };
  }

  /**
   * Convierte una imagen a tensor
   */
  private async imageToTensor(imageSrc: string): Promise<tf.Tensor4D> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([ML_CONFIG.MODEL.IMAGE_SIZE, ML_CONFIG.MODEL.IMAGE_SIZE])
          .toFloat()
          .div(255.0)
          .expandDims(0);
        resolve(tensor as tf.Tensor4D);
      };
      img.src = imageSrc;
    });
  }

  /**
   * Crea el modelo usando transfer learning con MobileNet
   */
  async createModel(numClasses: number): Promise<tf.LayersModel> {
    // Cargar MobileNet preentrenado
    const mobilenet = await tf.loadLayersModel('https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/classification/2');
    
    // Crear modelo personalizado
    const model = tf.sequential({
      layers: [
        // Capa base de MobileNet (sin la última capa de clasificación)
        tf.layers.dense({
          inputShape: [1000], // MobileNet output
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: ML_CONFIG.TRAINING.TRANSFER_LEARNING.DROPOUT_RATE }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: ML_CONFIG.TRAINING.TRANSFER_LEARNING.DROPOUT_RATE }),
        tf.layers.dense({
          units: numClasses,
          activation: 'softmax'
        })
      ]
    });

    // Compilar modelo
    model.compile({
      optimizer: tf.train.adam(ML_CONFIG.TRAINING.DEFAULT_LEARNING_RATE),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    return model;
  }

  /**
   * Entrena el modelo
   */
  async trainModel(
    trainingData: TrainingData,
    onEpochEnd?: (metrics: TrainingMetrics) => void
  ): Promise<tf.History> {
    if (!this.model) {
      throw new Error('Modelo no inicializado');
    }

    const { images, labels } = trainingData;

    // Dividir datos en entrenamiento y validación
    const numSamples = images.shape[0];
    const numTraining = Math.floor(numSamples * (1 - ML_CONFIG.TRAINING.VALIDATION_SPLIT));

    const trainImages = images.slice([0, 0, 0, 0], [numTraining, -1, -1, -1]);
    const trainLabels = labels.slice([0, 0], [numTraining, -1]);
    const valImages = images.slice([numTraining, 0, 0, 0], [-1, -1, -1, -1]);
    const valLabels = labels.slice([numTraining, 0], [-1, -1]);

    // Configurar callbacks
    const callbacks: tf.CustomCallback[] = [];
    
    if (onEpochEnd) {
      callbacks.push({
        onEpochEnd: async (epoch: number, logs: any) => {
          const metrics: TrainingMetrics = {
            epoch: epoch + 1,
            loss: typeof logs?.loss === 'number' ? logs.loss : (logs?.loss as tf.Scalar)?.dataSync()[0] || 0,
            accuracy: typeof logs?.acc === 'number' ? logs.acc : (logs?.acc as tf.Scalar)?.dataSync()[0] || 0,
            valLoss: typeof logs?.val_loss === 'number' ? logs.val_loss : (logs?.val_loss as tf.Scalar)?.dataSync()[0],
            valAccuracy: typeof logs?.val_acc === 'number' ? logs.val_acc : (logs?.val_acc as tf.Scalar)?.dataSync()[0]
          };
          onEpochEnd(metrics);
        }
      } as tf.CustomCallback);
    }

    // Entrenar modelo
    const history = await this.model.fit(trainImages, trainLabels, {
      epochs: ML_CONFIG.TRAINING.DEFAULT_EPOCHS,
      batchSize: ML_CONFIG.TRAINING.DEFAULT_BATCH_SIZE,
      validationData: [valImages, valLabels],
      callbacks,
      shuffle: true
    });

    // Limpiar tensores
    trainImages.dispose();
    trainLabels.dispose();
    valImages.dispose();
    valLabels.dispose();

    return history;
  }

  /**
   * Hace predicciones con el modelo entrenado
   */
  async predict(imageSrc: string): Promise<{ className: string; confidence: number }[]> {
    if (!this.model) {
      throw new Error('Modelo no entrenado');
    }

    const tensor = await this.imageToTensor(imageSrc);
    const predictions = this.model.predict(tensor) as tf.Tensor;
    const probabilities = await predictions.data();
    
    tensor.dispose();
    predictions.dispose();

    // Obtener las mejores predicciones
    const results = Array.from(probabilities)
      .map((prob, index) => ({
        className: this.classes[index],
        confidence: prob
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, ML_CONFIG.METRICS.TOP_K_PREDICTIONS);

    return results;
  }

  /**
   * Guarda el modelo entrenado
   */
  async saveModel(name: string): Promise<void> {
    if (!this.model) {
      throw new Error('No hay modelo para guardar');
    }

    await this.model.save(`localstorage://${name}`);
    
    // Guardar también las clases
    localStorage.setItem(`${name}_classes`, JSON.stringify(this.classes));
  }

  /**
   * Carga un modelo guardado
   */
  async loadModel(name: string): Promise<void> {
    this.model = await tf.loadLayersModel(`localstorage://${name}`);
    
    // Cargar también las clases
    const classesData = localStorage.getItem(`${name}_classes`);
    if (classesData) {
      this.classes = JSON.parse(classesData);
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
}
