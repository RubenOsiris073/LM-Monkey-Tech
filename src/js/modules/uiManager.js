/**
 * Gestor de interfaz de usuario para el entrenamiento
 */

import { CONFIG } from '../config/config.js';

export class UIManager {
    /**
     * Obtiene elementos del DOM para entrenamiento
     */
    getTrainingElements() {
        return {
            redShirts: document.getElementById(CONFIG.UI.SELECTORS.RED_SHIRTS),
            grayShirts: document.getElementById(CONFIG.UI.SELECTORS.GRAY_SHIRTS),
            blueShirts: document.getElementById(CONFIG.UI.SELECTORS.BLUE_SHIRTS),
            trainButton: document.getElementById(CONFIG.UI.SELECTORS.TRAIN_BUTTON),
            progressSection: document.getElementById(CONFIG.UI.SELECTORS.PROGRESS_SECTION),
            progressFill: document.getElementById(CONFIG.UI.SELECTORS.PROGRESS_FILL),
            progressText: document.getElementById(CONFIG.UI.SELECTORS.PROGRESS_TEXT),
            metricsDisplay: document.getElementById(CONFIG.UI.SELECTORS.METRICS_DISPLAY),
            modelSection: document.getElementById(CONFIG.UI.SELECTORS.MODEL_SECTION),
            downloadBtn: document.getElementById(CONFIG.UI.SELECTORS.DOWNLOAD_MODEL),
            testBtn: document.getElementById(CONFIG.UI.SELECTORS.TEST_MODEL)
        };
    }

    /**
     * Limpia el preview de imágenes
     */
    clearImagePreview(previewId) {
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.innerHTML = '';
        }
    }

    /**
     * Agrega una imagen al preview
     */
    addImageToPreview(previewId, imageElement) {
        const preview = document.getElementById(previewId);
        if (preview && imageElement) {
            preview.appendChild(imageElement);
        }
    }

    /**
     * Actualiza el contador de imágenes
     */
    updateImageCount(countId, count) {
        const countElement = document.getElementById(countId);
        if (countElement) {
            countElement.textContent = `${count} imágenes`;
        }
    }

    /**
     * Actualiza el estado del botón de entrenamiento
     */
    updateTrainingButton(hasEnoughData, totalImages) {
        const trainButton = document.getElementById(CONFIG.UI.SELECTORS.TRAIN_BUTTON);
        if (!trainButton) return;

        trainButton.disabled = !hasEnoughData;

        if (hasEnoughData) {
            trainButton.textContent = `🚀 Entrenar Modelo (${totalImages} imágenes)`;
        } else {
            trainButton.textContent = `🚀 Entrenar Modelo (Necesitas al menos ${CONFIG.MODEL.MIN_IMAGES_PER_CLASS} por clase)`;
        }
    }

    /**
     * Muestra la sección de progreso
     */
    showProgressSection() {
        const progressSection = document.getElementById(CONFIG.UI.SELECTORS.PROGRESS_SECTION);
        if (progressSection) {
            progressSection.style.display = 'block';
        }
    }

    /**
     * Oculta la sección de progreso
     */
    hideProgressSection() {
        const progressSection = document.getElementById(CONFIG.UI.SELECTORS.PROGRESS_SECTION);
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    }

    /**
     * Configura el estado de entrenamiento en progreso
     */
    setTrainingInProgress(inProgress) {
        const trainButton = document.getElementById(CONFIG.UI.SELECTORS.TRAIN_BUTTON);
        if (trainButton) {
            trainButton.disabled = inProgress;
            trainButton.textContent = inProgress ? '🔄 Entrenando...' : '🚀 Entrenar Modelo';
        }
    }

    /**
     * Actualiza el progreso del entrenamiento
     */
    updateTrainingProgress(metrics) {
        const progressFill = document.getElementById(CONFIG.UI.SELECTORS.PROGRESS_FILL);
        const progressText = document.getElementById(CONFIG.UI.SELECTORS.PROGRESS_TEXT);
        const metricsDisplay = document.getElementById(CONFIG.UI.SELECTORS.METRICS_DISPLAY);

        if (progressFill) {
            progressFill.style.width = `${metrics.progress}%`;
        }

        if (progressText) {
            progressText.textContent = `Época ${metrics.epoch}/${metrics.totalEpochs}`;
        }

        if (metricsDisplay) {
            metricsDisplay.innerHTML = `
                <div class="${CONFIG.UI.CLASSES.METRICS}">
                    <span>Pérdida: ${metrics.loss.toFixed(4)}</span>
                    <span>Precisión: ${(metrics.accuracy * 100).toFixed(2)}%</span>
                    ${metrics.valLoss ? `<span>Val. Pérdida: ${metrics.valLoss.toFixed(4)}</span>` : ''}
                    ${metrics.valAccuracy ? `<span>Val. Precisión: ${(metrics.valAccuracy * 100).toFixed(2)}%</span>` : ''}
                </div>
            `;
        }
    }

    /**
     * Muestra la sección del modelo entrenado
     */
    showModelSection() {
        const modelSection = document.getElementById(CONFIG.UI.SELECTORS.MODEL_SECTION);
        if (modelSection) {
            modelSection.style.display = 'block';
        }
    }

    /**
     * Oculta la sección del modelo
     */
    hideModelSection() {
        const modelSection = document.getElementById(CONFIG.UI.SELECTORS.MODEL_SECTION);
        if (modelSection) {
            modelSection.style.display = 'none';
        }
    }

    /**
     * Configura el estado de entrenamiento completado
     */
    setTrainingCompleted() {
        const progressText = document.getElementById(CONFIG.UI.SELECTORS.PROGRESS_TEXT);
        if (progressText) {
            progressText.textContent = '✅ Entrenamiento completado y modelo guardado!';
        }
    }

    /**
     * Configura el estado de error en entrenamiento
     */
    setTrainingError(errorMessage) {
        const progressText = document.getElementById(CONFIG.UI.SELECTORS.PROGRESS_TEXT);
        if (progressText) {
            progressText.textContent = `❌ Error: ${errorMessage}`;
            progressText.style.color = '#f44336';
        }
    }

    /**
     * Muestra un mensaje de estado general
     */
    showStatusMessage(message, type = 'info') {
        // Crear o actualizar elemento de mensaje
        let statusElement = document.getElementById('status-message');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'status-message';
            statusElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(statusElement);
        }

        // Configurar estilos según el tipo
        const styles = {
            info: 'background: #2196F3;',
            success: 'background: #4CAF50;',
            warning: 'background: #FF9800;',
            error: 'background: #F44336;'
        };

        statusElement.style.cssText += styles[type] || styles.info;
        statusElement.textContent = message;

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            if (statusElement && statusElement.parentNode) {
                statusElement.style.opacity = '0';
                setTimeout(() => {
                    if (statusElement && statusElement.parentNode) {
                        statusElement.parentNode.removeChild(statusElement);
                    }
                }, 300);
            }
        }, 5000);
    }

    /**
     * Actualiza múltiples elementos de imagen de una vez
     */
    updateImageSection(categoryData) {
        Object.entries(categoryData).forEach(([category, data]) => {
            this.updateImageCount(`${category}Count`, data.count);
            if (data.preview) {
                this.clearImagePreview(`${category}Preview`);
                data.preview.forEach(img => {
                    this.addImageToPreview(`${category}Preview`, img);
                });
            }
        });
    }
}
