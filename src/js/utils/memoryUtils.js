/**
 * Utilidades para manejo de memoria y rendimiento
 */

import { CONFIG } from '../config/config.js';

export class MemoryUtils {
    /**
     * Configura TensorFlow.js para usar CPU
     */
    static async setupTensorFlow() {
        try {
            await tf.setBackend(CONFIG.TENSORFLOW.BACKEND);
            console.log(`TensorFlow.js configurado para usar ${CONFIG.TENSORFLOW.BACKEND.toUpperCase()}`);
            return true;
        } catch (error) {
            console.warn(`No se pudo configurar backend ${CONFIG.TENSORFLOW.BACKEND}, usando default:`, error);
            return false;
        }
    }

    /**
     * Limpia tensores de un array
     * @param {Array<tf.Tensor>} tensors - Array de tensores a limpiar
     */
    static disposeTensors(tensors) {
        if (Array.isArray(tensors)) {
            tensors.forEach(tensor => {
                if (tensor && typeof tensor.dispose === 'function') {
                    tensor.dispose();
                }
            });
        }
    }

    /**
     * Reporta el uso de memoria actual
     */
    static reportMemoryUsage() {
        if (tf.memory) {
            const memInfo = tf.memory();
            console.log('Memoria TensorFlow.js:', {
                numTensors: memInfo.numTensors,
                numDataBuffers: memInfo.numDataBuffers,
                numBytes: memInfo.numBytes,
                unreliable: memInfo.unreliable || false
            });
            return memInfo;
        }
        return null;
    }

    /**
     * Limpia memoria de TensorFlow.js
     */
    static cleanupMemory() {
        if (tf.dispose) {
            tf.dispose();
        }
        // Forzar garbage collection si está disponible
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * Ejecuta una función con manejo de memoria
     * @param {Function} fn - Función a ejecutar
     * @param {string} context - Contexto para logging
     */
    static async withMemoryManagement(fn, context = 'operación') {
        const initialMemory = this.reportMemoryUsage();
        console.log(`Iniciando ${context}...`);
        
        try {
            const result = await fn();
            const finalMemory = this.reportMemoryUsage();
            
            if (initialMemory && finalMemory) {
                const tensorDiff = finalMemory.numTensors - initialMemory.numTensors;
                console.log(`${context} completada. Tensores creados: ${tensorDiff}`);
            }
            
            return result;
        } catch (error) {
            console.error(`Error en ${context}:`, error);
            throw error;
        }
    }
}
