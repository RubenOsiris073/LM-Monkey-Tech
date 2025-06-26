/**
 * Configuración para clasificación de productos de abarrotes
 */
import * as tf from '@tensorflow/tfjs';

export const ML_CONFIG = {
  // Configuración del modelo
  MODEL: {
    IMAGE_SIZE: 224, // Aumentado para mejor precisión en productos
    INPUT_SHAPE: [224, 224, 3],
    CLASSES: [], // Se llenará dinámicamente por el usuario
    MIN_IMAGES_PER_CLASS: 10, // Mínimo de imágenes por producto
    MAX_CLASSES: 50, // Máximo de categorías de productos
  },

  // Configuración de entrenamiento optimizada para productos
  TRAINING: {
    DEFAULT_EPOCHS: 20,
    DEFAULT_BATCH_SIZE: 16,
    DEFAULT_LEARNING_RATE: 0.001,
    VALIDATION_SPLIT: 0.2,
    EARLY_STOPPING_PATIENCE: 5,
    
    // Configuración para transfer learning con MobileNet
    TRANSFER_LEARNING: {
      BASE_MODEL: 'mobilenet',
      FREEZE_BASE: true,
      FINE_TUNE_LAYERS: 10,
      DROPOUT_RATE: 0.5
    }
  },

  // Categorías predefinidas de productos de abarrotes
  PRODUCT_CATEGORIES: {
    FRUTAS: ['manzana', 'plátano', 'naranja', 'limón', 'uva', 'fresa', 'piña', 'sandía'],
    VERDURAS: ['tomate', 'cebolla', 'papa', 'zanahoria', 'lechuga', 'brócoli', 'pimiento'],
    LACTEOS: ['leche', 'queso', 'yogurt', 'mantequilla', 'crema'],
    CEREALES: ['arroz', 'avena', 'quinoa', 'trigo', 'maíz'],
    CARNES: ['pollo', 'res', 'cerdo', 'pescado', 'jamón'],
    BEBIDAS: ['agua', 'jugo', 'refresco', 'café', 'té'],
    SNACKS: ['galletas', 'papas fritas', 'chocolates', 'dulces'],
    CONDIMENTOS: ['sal', 'pimienta', 'aceite', 'vinagre', 'salsa']
  },

  // Configuración de almacenamiento
  STORAGE: {
    MODELS_KEY: 'grocery-ml-models',
    CLASSES_KEY: 'grocery-classes',
    TRAINING_DATA_KEY: 'grocery-training-data',
    SETTINGS_KEY: 'grocery-settings'
  },

  // Configuración de la interfaz
  UI: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
    PREVIEW_SIZE: 150,
    GRID_COLS: 4,
    
    // Colores del tema
    COLORS: {
      PRIMARY: '#3B82F6',
      SECONDARY: '#10B981',
      ACCENT: '#F59E0B',
      ERROR: '#EF4444',
      WARNING: '#F59E0B',
      SUCCESS: '#10B981'
    }
  },

  // Métricas y evaluación
  METRICS: {
    CONFIDENCE_THRESHOLD: 0.7,
    TOP_K_PREDICTIONS: 3,
    EVALUATION_METRICS: ['accuracy', 'precision', 'recall', 'f1Score']
  }
};

// Configuración de TensorFlow.js
export const TF_CONFIG = {
  BACKEND: 'webgl', // Mejor rendimiento para imágenes
  MEMORY_GROWTH: true,
  DEBUG: false
};

// Tipos TypeScript para mejor tipado
export interface TrainingData {
  images: tf.Tensor4D;
  labels: tf.Tensor2D;
  classNames: string[];
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface ModelPrediction {
  className: string;
  confidence: number;
  index: number;
}
