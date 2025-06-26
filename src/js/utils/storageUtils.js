/**
 * Utilidades para almacenamiento del modelo
 */

import { CONFIG } from '../config/config.js';

export class StorageUtils {
    /**
     * Guarda un modelo entrenado con fallback automático
     * @param {tf.LayersModel} model - Modelo a guardar
     * @returns {Promise<string>} Ubicación donde se guardó el modelo
     */
    static async saveModel(model) {
        // Intentar guardar en IndexedDB primero (mayor capacidad)
        try {
            await model.save(`indexeddb://${CONFIG.STORAGE.INDEXEDDB_KEY}`);
            localStorage.setItem(CONFIG.MODEL.STORAGE_KEYS.TRAINED_MODEL, 'true');
            localStorage.setItem(CONFIG.MODEL.STORAGE_KEYS.MODEL_LOCATION, 'indexeddb');
            console.log('✅ Modelo guardado en IndexedDB');
            return 'indexeddb';
        } catch (saveError) {
            console.warn('No se pudo guardar en IndexedDB, intentando localStorage reducido...');
            
            try {
                // Guardar en localStorage como fallback
                await model.save(`localstorage://${CONFIG.STORAGE.LOCALSTORAGE_KEY}`);
                localStorage.setItem(CONFIG.MODEL.STORAGE_KEYS.TRAINED_MODEL, 'true');
                localStorage.setItem(CONFIG.MODEL.STORAGE_KEYS.MODEL_LOCATION, 'localstorage');
                console.log('✅ Modelo guardado en localStorage');
                return 'localstorage';
            } catch (compactError) {
                console.error('Error guardando modelo:', compactError);
                throw new Error('No se pudo guardar el modelo en ningún almacenamiento');
            }
        }
    }

    /**
     * Carga un modelo desde el almacenamiento local
     * @returns {Promise<tf.LayersModel|null>} Modelo cargado o null si no existe
     */
    static async loadModel() {
        const modelLocation = localStorage.getItem(CONFIG.MODEL.STORAGE_KEYS.MODEL_LOCATION);
        
        try {
            if (modelLocation === 'indexeddb') {
                console.log('Cargando modelo desde IndexedDB...');
                return await tf.loadLayersModel(`indexeddb://${CONFIG.STORAGE.INDEXEDDB_KEY}`);
            } else if (modelLocation === 'localstorage') {
                console.log('Cargando modelo desde localStorage...');
                return await tf.loadLayersModel(`localstorage://${CONFIG.STORAGE.LOCALSTORAGE_KEY}`);
            }
            
            // Fallback: intentar cargar desde localStorage con nombre original
            console.log('Intentando cargar modelo desde localStorage (fallback)...');
            return await tf.loadLayersModel(`localstorage://${CONFIG.STORAGE.INDEXEDDB_KEY}`);
            
        } catch (error) {
            console.log('No se encontró modelo guardado:', error.message);
            return null;
        }
    }

    /**
     * Descarga un modelo como archivos
     * @param {tf.LayersModel} model - Modelo a descargar
     */
    static async downloadModel(model) {
        if (!model) {
            throw new Error('No hay modelo para descargar');
        }
        
        try {
            await model.save(`downloads://${CONFIG.STORAGE.DOWNLOADS_KEY}`);
            return true;
        } catch (error) {
            console.error('Error descargando modelo:', error);
            throw error;
        }
    }

    /**
     * Verifica si existe un modelo entrenado
     * @returns {boolean} True si existe modelo entrenado
     */
    static hasTrainedModel() {
        return localStorage.getItem(CONFIG.MODEL.STORAGE_KEYS.TRAINED_MODEL) === 'true';
    }

    /**
     * Limpia el almacenamiento del modelo
     */
    static clearModelStorage() {
        localStorage.removeItem(CONFIG.MODEL.STORAGE_KEYS.TRAINED_MODEL);
        localStorage.removeItem(CONFIG.MODEL.STORAGE_KEYS.MODEL_LOCATION);
        
        // Intentar limpiar también los modelos almacenados
        try {
            // Note: No hay API directa para eliminar de IndexedDB/localStorage en TensorFlow.js
            console.log('Almacenamiento del modelo limpiado');
        } catch (error) {
            console.warn('No se pudo limpiar completamente el almacenamiento:', error);
        }
    }
}
