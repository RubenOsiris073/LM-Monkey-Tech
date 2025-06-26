/**
 * Configuración global de la aplicación
 * Contiene constantes y configuraciones del modelo
 */

export const CONFIG = {
    // Configuración del modelo
    MODEL: {
        IMAGE_SIZE: 32,
        CLASSES: ['roja', 'gris', 'azul'],
        MIN_IMAGES_PER_CLASS: 3,
        STORAGE_KEYS: {
            TRAINED_MODEL: 'hasTrainedModel',
            MODEL_LOCATION: 'modelLocation'
        }
    },

    // Configuración de entrenamiento
    TRAINING: {
        DEFAULT_EPOCHS: 5,
        DEFAULT_BATCH_SIZE: 2,
        DEFAULT_LEARNING_RATE: 0.01,
        VALIDATION_SPLIT: 0.1,
        
        // Configuración optimizada para recursos limitados
        OPTIMIZED: {
            FILTERS_MAIN: 4,
            FILTERS_COMPACT: 2,
            KERNEL_SIZE_MAIN: 5,
            KERNEL_SIZE_COMPACT: 8,
            POOLING_SIZE_MAIN: 4,
            POOLING_SIZE_COMPACT: 8,
            DENSE_UNITS_MAIN: 8,
            DENSE_UNITS_COMPACT: 4
        }
    },

    // Configuración de la UI
    UI: {
        SELECTORS: {
            RED_SHIRTS: 'redShirts',
            GRAY_SHIRTS: 'grayShirts',
            BLUE_SHIRTS: 'blueShirts',
            TRAIN_BUTTON: 'trainButton',
            PROGRESS_SECTION: 'progressSection',
            PROGRESS_FILL: 'progressFill',
            PROGRESS_TEXT: 'progressText',
            METRICS_DISPLAY: 'metricsDisplay',
            MODEL_SECTION: 'modelSection',
            DOWNLOAD_MODEL: 'downloadModel',
            TEST_MODEL: 'testModel'
        },
        
        CLASSES: {
            PREVIEW_IMG: 'preview-img',
            METRICS: 'metrics'
        }
    },

    // Configuración de almacenamiento
    STORAGE: {
        INDEXEDDB_KEY: 'shirt-classifier-model',
        LOCALSTORAGE_KEY: 'shirt-classifier-compact',
        DOWNLOADS_KEY: 'shirt-classifier-model'
    },

    // Configuración de TensorFlow
    TENSORFLOW: {
        BACKEND: 'cpu',
        MEMORY_CLEANUP_INTERVAL: 1000
    }
};
