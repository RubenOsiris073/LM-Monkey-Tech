/**
 * Factory para crear modelos de TensorFlow.js optimizados
 */

import { CONFIG } from '../config/config.js';

export class ModelFactory {
    /**
     * Crea un modelo principal optimizado para entrenamiento
     * @returns {tf.Sequential} Modelo secuencial optimizado
     */
    static createMainModel() {
        console.log('Creando modelo principal optimizado...');
        
        const model = tf.sequential({
            layers: [
                // Capa convolucional con filtros reducidos
                tf.layers.conv2d({
                    inputShape: [CONFIG.MODEL.IMAGE_SIZE, CONFIG.MODEL.IMAGE_SIZE, 3],
                    filters: CONFIG.TRAINING.OPTIMIZED.FILTERS_MAIN,
                    kernelSize: CONFIG.TRAINING.OPTIMIZED.KERNEL_SIZE_MAIN,
                    activation: 'relu',
                    name: 'conv2d_main'
                }),
                
                // Pooling agresivo para reducir dimensiones
                tf.layers.maxPooling2d({ 
                    poolSize: CONFIG.TRAINING.OPTIMIZED.POOLING_SIZE_MAIN,
                    name: 'pooling_main'
                }),
                
                // Aplanamiento
                tf.layers.flatten({ name: 'flatten' }),
                
                // Capa densa intermedia
                tf.layers.dense({
                    units: CONFIG.TRAINING.OPTIMIZED.DENSE_UNITS_MAIN,
                    activation: 'relu',
                    name: 'dense_hidden'
                }),
                
                // Capa de salida para clasificación
                tf.layers.dense({
                    units: CONFIG.MODEL.CLASSES.length,
                    activation: 'softmax',
                    name: 'dense_output'
                })
            ]
        });
        
        // Compilar modelo
        model.compile({
            optimizer: tf.train.adam(CONFIG.TRAINING.DEFAULT_LEARNING_RATE),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        console.log(`Modelo principal creado. Parámetros: ${model.countParams()}`);
        return model;
    }

    /**
     * Crea un modelo ultra-compacto para localStorage
     * @returns {tf.Sequential} Modelo secuencial ultra-compacto
     */
    static createCompactModel() {
        console.log('Creando modelo ultra-compacto...');
        
        const model = tf.sequential({
            layers: [
                // Capa convolucional ultra-reducida
                tf.layers.conv2d({
                    inputShape: [CONFIG.MODEL.IMAGE_SIZE, CONFIG.MODEL.IMAGE_SIZE, 3],
                    filters: CONFIG.TRAINING.OPTIMIZED.FILTERS_COMPACT,
                    kernelSize: CONFIG.TRAINING.OPTIMIZED.KERNEL_SIZE_COMPACT,
                    activation: 'relu',
                    name: 'conv2d_compact'
                }),
                
                // Pooling muy agresivo
                tf.layers.maxPooling2d({ 
                    poolSize: CONFIG.TRAINING.OPTIMIZED.POOLING_SIZE_COMPACT,
                    name: 'pooling_compact'
                }),
                
                // Aplanamiento
                tf.layers.flatten({ name: 'flatten_compact' }),
                
                // Capa densa mínima
                tf.layers.dense({
                    units: CONFIG.TRAINING.OPTIMIZED.DENSE_UNITS_COMPACT,
                    activation: 'relu',
                    name: 'dense_compact'
                }),
                
                // Capa de salida
                tf.layers.dense({
                    units: CONFIG.MODEL.CLASSES.length,
                    activation: 'softmax',
                    name: 'output_compact'
                })
            ]
        });
        
        // Compilar modelo compacto
        model.compile({
            optimizer: tf.train.adam(CONFIG.TRAINING.DEFAULT_LEARNING_RATE),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        console.log(`Modelo compacto creado. Parámetros: ${model.countParams()}`);
        return model;
    }

    /**
     * Crea callbacks de entrenamiento personalizados
     * @param {number} totalEpochs - Total de épocas
     * @param {Function} progressCallback - Callback para actualizar progreso
     * @returns {Object} Callbacks configurados
     */
    static createTrainingCallbacks(totalEpochs, progressCallback) {
        return {
            onEpochEnd: (epoch, logs) => {
                const progress = ((epoch + 1) / totalEpochs) * 100;
                const metrics = {
                    epoch: epoch + 1,
                    totalEpochs,
                    progress,
                    loss: logs.loss,
                    accuracy: logs.acc,
                    valLoss: logs.val_loss,
                    valAccuracy: logs.val_acc
                };
                
                console.log(`Época ${epoch + 1}/${totalEpochs} - Loss: ${logs.loss.toFixed(4)}, Accuracy: ${logs.acc.toFixed(4)}`);
                
                if (progressCallback) {
                    progressCallback(metrics);
                }
            },
            
            onTrainEnd: () => {
                console.log('Entrenamiento completado');
            }
        };
    }

    /**
     * Valida la arquitectura del modelo
     * @param {tf.Sequential} model - Modelo a validar
     * @returns {boolean} True si el modelo es válido
     */
    static validateModel(model) {
        try {
            if (!model || typeof model.predict !== 'function') {
                return false;
            }
            
            // Verificar que el modelo tiene las capas esperadas
            const layers = model.layers;
            if (layers.length < 3) { // Al menos conv, flatten, dense
                return false;
            }
            
            // Verificar shape de salida
            const outputShape = model.outputShape;
            if (!outputShape || outputShape[outputShape.length - 1] !== CONFIG.MODEL.CLASSES.length) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error validando modelo:', error);
            return false;
        }
    }
}
