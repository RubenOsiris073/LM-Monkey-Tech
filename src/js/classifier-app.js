/**
 * Script principal optimizado para la página de clasificación
 * Usa la nueva estructura modular
 */

import { CONFIG } from './config/config.js';
import { MemoryUtils } from './utils/memoryUtils.js';
import { StorageUtils } from './utils/storageUtils.js';
import { ImageUtils } from './utils/imageUtils.js';

/**
 * Clasificador de camisas optimizado
 */
class ShirtClassifier {
    constructor() {
        this.customModel = null;
        this.mobilenetModel = null;
        this.currentModel = 'custom';
        this.isInitialized = false;
    }

    /**
     * Inicializa la aplicación
     */
    async initialize() {
        try {
            console.log('🚀 Inicializando clasificador de camisas...');
            
            // Configurar TensorFlow.js
            await MemoryUtils.setupTensorFlow();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Verificar modelo guardado
            await this.checkForSavedModel();
            
            this.isInitialized = true;
            this.updateModelStatus('Listo para clasificar');
            
            console.log('✅ Clasificador inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando clasificador:', error);
            this.updateModelStatus('Error en inicialización');
        }
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Elementos del DOM
        const imageInput = document.getElementById('imageInput');
        const dropZone = document.getElementById('dropZone');
        const analyzeButton = document.getElementById('analyzeButton');
        const loadModelBtn = document.getElementById('loadModelBtn');
        const modelLoader = document.getElementById('modelLoader');
        const modelRadios = document.querySelectorAll('input[name="modelType"]');

        // Event listeners principales
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        if (analyzeButton) {
            analyzeButton.addEventListener('click', () => this.classifyImage());
        }
        
        if (loadModelBtn) {
            loadModelBtn.addEventListener('click', () => modelLoader?.click());
        }
        
        if (modelLoader) {
            modelLoader.addEventListener('change', (e) => this.loadCustomModel(e));
        }

        // Drag and drop
        if (dropZone) {
            dropZone.addEventListener('dragover', this.handleDragOver);
            dropZone.addEventListener('drop', (e) => this.handleDrop(e));
            dropZone.addEventListener('click', () => imageInput?.click());
        }

        // Cambio de modelo
        modelRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.switchModel(e.target.value));
        });

        console.log('Event listeners configurados');
    }

    /**
     * Maneja el evento dragover
     */
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Maneja el evento drop
     */
    handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
            this.displayImage(imageFile);
        }
    }

    /**
     * Maneja la carga de imágenes
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.displayImage(file);
        }
    }

    /**
     * Muestra la imagen seleccionada
     */
    displayImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('selectedImage');
            if (img) {
                img.src = e.target.result;
                img.onload = () => {
                    const imagePreview = document.getElementById('imagePreview');
                    const results = document.getElementById('results');
                    const analyzeButton = document.getElementById('analyzeButton');

                    if (imagePreview) imagePreview.style.display = 'block';
                    if (results) results.style.display = 'none';

                    // Habilitar/deshabilitar botón según modelo disponible
                    if (analyzeButton) {
                        const hasModel = (this.currentModel === 'custom' && this.customModel) || 
                                        (this.currentModel === 'mobilenet' && this.mobilenetModel);
                        analyzeButton.disabled = !hasModel;

                        analyzeButton.textContent = hasModel ? 
                            '🔍 Clasificar Camisa' : 
                            '⚠️ Sin modelo disponible';
                    }
                };
            }
        };
        reader.readAsDataURL(file);
    }

    /**
     * Cambia entre tipos de modelo
     */
    async switchModel(modelType) {
        this.currentModel = modelType;

        if (modelType === 'mobilenet' && !this.mobilenetModel) {
            this.updateModelStatus('Cargando MobileNet...');
            try {
                // Simulación de carga de MobileNet
                await new Promise(resolve => setTimeout(resolve, 2000));
                this.mobilenetModel = { loaded: true }; // Mock
                this.updateModelStatus('MobileNet cargado');
            } catch (error) {
                console.error('Error cargando MobileNet:', error);
                this.updateModelStatus('Error cargando MobileNet');
            }
        } else if (modelType === 'custom') {
            if (this.customModel) {
                this.updateModelStatus('Modelo personalizado activo');
            } else {
                this.updateModelStatus('Sin modelo personalizado - Entrenar primero');
            }
        }
    }

    /**
     * Verifica si hay un modelo guardado
     */
    async checkForSavedModel() {
        try {
            this.customModel = await StorageUtils.loadModel();
            
            if (this.customModel) {
                this.updateModelStatus('✅ Modelo personalizado cargado');
                console.log('Modelo cargado desde almacenamiento local');
            } else if (StorageUtils.hasTrainedModel()) {
                this.updateModelStatus('⚠️ Modelo entrenado pero no cargado - Recarga la página');
            } else {
                this.updateModelStatus('❌ Sin modelo personalizado - Entrenar primero');
                this.disableAnalyzeButton();
            }
        } catch (error) {
            console.error('Error verificando modelo guardado:', error);
            this.updateModelStatus('Error verificando modelo');
        }
    }

    /**
     * Carga un modelo personalizado desde archivos
     */
    async loadCustomModel(event) {
        const files = Array.from(event.target.files);
        const modelFile = files.find(file => file.name.includes('model.json'));

        if (modelFile) {
            try {
                this.updateModelStatus('Cargando modelo personalizado...');

                const modelUrl = URL.createObjectURL(modelFile);
                this.customModel = await tf.loadLayersModel(modelUrl);

                this.updateModelStatus('Modelo personalizado cargado exitosamente');

                // Cambiar a modelo personalizado
                const customRadio = document.querySelector('input[value="custom"]');
                if (customRadio) {
                    customRadio.checked = true;
                    this.currentModel = 'custom';
                }

            } catch (error) {
                console.error('Error cargando modelo:', error);
                this.updateModelStatus('Error cargando modelo personalizado');
            }
        }
    }

    /**
     * Actualiza el estado del modelo en la UI
     */
    updateModelStatus(message) {
        const statusElement = document.getElementById('modelStatus');
        if (!statusElement) return;

        const spinner = statusElement.querySelector('.spinner');
        const text = statusElement.querySelector('span');

        if (text) text.textContent = message;

        if (spinner) {
            spinner.style.display = 
                (message.includes('Cargando') || message.includes('Preparando')) ? 
                'inline-block' : 'none';
        }
    }

    /**
     * Deshabilita el botón de análisis
     */
    disableAnalyzeButton() {
        const analyzeButton = document.getElementById('analyzeButton');
        if (analyzeButton) {
            analyzeButton.disabled = true;
        }
    }

    /**
     * Clasifica la imagen seleccionada
     */
    async classifyImage() {
        const img = document.getElementById('selectedImage');
        if (!img?.src) return;

        this.updateModelStatus('Clasificando imagen...');

        try {
            let predictions;

            if (this.currentModel === 'custom' && this.customModel) {
                predictions = await this.classifyWithCustomModel(img);
            } else if (this.currentModel === 'mobilenet' && this.mobilenetModel) {
                predictions = await this.classifyWithMobileNet(img);
            } else {
                throw new Error('No hay modelo disponible para clasificar');
            }

            this.displayResults(predictions);
            this.updateModelStatus('Clasificación completada');

        } catch (error) {
            console.error('Error en clasificación:', error);
            this.updateModelStatus('Error en clasificación');
            alert('Error clasificando imagen: ' + error.message);
        }
    }

    /**
     * Clasifica con el modelo personalizado
     */
    async classifyWithCustomModel(imgElement) {
        // Preprocesar imagen
        const tensor = tf.browser.fromPixels(imgElement)
            .resizeNearestNeighbor([CONFIG.MODEL.IMAGE_SIZE, CONFIG.MODEL.IMAGE_SIZE])
            .toFloat()
            .div(255.0)
            .expandDims(0);

        // Hacer predicción
        const prediction = this.customModel.predict(tensor);
        const probabilities = await prediction.data();

        // Crear resultados
        const results = CONFIG.MODEL.CLASSES.map((className, index) => ({
            className: `Camisa ${className}`,
            probability: probabilities[index]
        }));

        // Limpiar tensores
        tensor.dispose();
        prediction.dispose();

        return results.sort((a, b) => b.probability - a.probability);
    }

    /**
     * Clasifica con MobileNet (simulado)
     */
    async classifyWithMobileNet(imgElement) {
        // Simulación de clasificación con MobileNet
        const mockResults = [
            { className: 'Jersey/Camiseta', probability: Math.random() * 0.6 + 0.3 },
            { className: 'Polo shirt', probability: Math.random() * 0.4 + 0.1 },
            { className: 'Sweatshirt', probability: Math.random() * 0.3 + 0.05 },
            { className: 'Cardigan', probability: Math.random() * 0.2 + 0.02 },
            { className: 'T-shirt', probability: Math.random() * 0.15 + 0.01 }
        ];

        return mockResults.sort((a, b) => b.probability - a.probability);
    }

    /**
     * Muestra los resultados de clasificación
     */
    displayResults(predictions) {
        const resultsDiv = document.getElementById('results');
        const predictionsDiv = document.getElementById('predictions');

        if (!resultsDiv || !predictionsDiv) return;

        predictionsDiv.innerHTML = '';

        predictions.forEach((prediction, index) => {
            const confidence = (prediction.probability * 100).toFixed(2);
            const isHighConfidence = prediction.probability > 0.5;

            const predictionElement = document.createElement('div');
            predictionElement.className = `prediction ${isHighConfidence ? 'high-confidence' : ''}`;

            predictionElement.innerHTML = `
                <div class="prediction-header">
                    <span class="rank">#${index + 1}</span>
                    <span class="class-name">${prediction.className}</span>
                    <span class="confidence ${isHighConfidence ? 'high' : ''}">${confidence}%</span>
                </div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidence}%"></div>
                </div>
            `;

            predictionsDiv.appendChild(predictionElement);
        });

        resultsDiv.style.display = 'block';
    }
}

// Instancia global
let classifier = null;

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', async () => {
    classifier = new ShirtClassifier();
    await classifier.initialize();
});

/**
 * Limpiar recursos al cerrar
 */
window.addEventListener('beforeunload', () => {
    if (classifier) {
        MemoryUtils.cleanupMemory();
    }
});

export default classifier;
