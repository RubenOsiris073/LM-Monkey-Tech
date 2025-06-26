/**
 * Utilidades para manejo de imágenes y tensores
 */

import { CONFIG } from '../config/config.js';

export class ImageUtils {
    /**
     * Convierte un archivo de imagen a tensor de TensorFlow
     * @param {File} file - Archivo de imagen
     * @returns {Promise<tf.Tensor>} Tensor de la imagen
     */
    static async fileToTensor(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = CONFIG.MODEL.IMAGE_SIZE;
                    canvas.height = CONFIG.MODEL.IMAGE_SIZE;
                    
                    // Dibujar imagen redimensionada
                    ctx.drawImage(img, 0, 0, CONFIG.MODEL.IMAGE_SIZE, CONFIG.MODEL.IMAGE_SIZE);
                    
                    // Convertir a tensor normalizado
                    const tensor = tf.browser.fromPixels(canvas).div(255.0);
                    
                    console.log(`Tensor creado con forma:`, tensor.shape);
                    resolve(tensor);
                } catch (error) {
                    console.error('Error creando tensor:', error);
                    reject(error);
                }
            };
            
            img.onerror = (error) => {
                console.error('Error cargando imagen:', error);
                reject(error);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Crea un elemento de preview para una imagen
     * @param {File} file - Archivo de imagen
     * @returns {HTMLImageElement} Elemento imagen para preview
     */
    static createPreviewImage(file) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = CONFIG.UI.CLASSES.PREVIEW_IMG;
        return img;
    }

    /**
     * Mezcla arrays usando algoritmo Fisher-Yates
     * @param {Array} array - Array a mezclar
     * @returns {Array} Array mezclado
     */
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Limpia recursos de imagen para liberar memoria
     * @param {string} objectUrl - URL del objeto a limpiar
     */
    static cleanupImageUrl(objectUrl) {
        if (objectUrl && objectUrl.startsWith('blob:')) {
            URL.revokeObjectURL(objectUrl);
        }
    }
}
