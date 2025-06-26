/**
 * Módulo principal de entrenamiento del modelo
 */

import { CONFIG } from '../config/config.js';
import { ImageUtils } from '../utils/imageUtils.js';
import { MemoryUtils } from '../utils/memoryUtils.js';
import { StorageUtils } from '../utils/storageUtils.js';
import { ModelFactory } from './modelFactory.js';
import { UIManager } from './uiManager.js';

export class TrainingEngine {
    constructor() {
        this.model = null;
        this.trainingData = {
            red: [],
            gray: [],
            blue: []
        };
        this.uiManager = new UIManager();
        this.isTraining = false;
    }

    /**
     * Inicializa el motor de entrenamiento
     */
    async initialize() {
        await MemoryUtils.setupTensorFlow();
        this.setupEventListeners();
        console.log('Motor de entrenamiento inicializado');
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        const elements = this.uiManager.getTrainingElements();
        
        if (!elements.redShirts || !elements.grayShirts || !elements.blueShirts || !elements.trainButton) {
            console.error('No se encontraron elementos HTML necesarios');
            return;
        }

        // Event listeners para carga de imágenes
        elements.redShirts.addEventListener('change', (e) => 
            this.handleImageUpload(e, 'red', 'redPreview', 'redCount'));
        elements.grayShirts.addEventListener('change', (e) => 
            this.handleImageUpload(e, 'gray', 'grayPreview', 'grayCount'));
        elements.blueShirts.addEventListener('change', (e) => 
            this.handleImageUpload(e, 'blue', 'bluePreview', 'blueCount'));

        // Botón de entrenamiento
        elements.trainButton.addEventListener('click', () => this.startTraining());

        // Botones adicionales
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', () => this.downloadModel());
        }
        if (elements.testBtn) {
            elements.testBtn.addEventListener('click', () => this.redirectToTest());
        }

        console.log('Event listeners configurados');
    }

    /**
     * Maneja la carga de imágenes
     */
    async handleImageUpload(event, category, previewId, countId) {
        const files = Array.from(event.target.files);
        console.log(`Cargando ${files.length} imágenes para categoría: ${category}`);

        // UI updates
        this.uiManager.clearImagePreview(previewId);
        this.trainingData[category] = [];

        // Procesar imágenes
        for (let file of files) {
            try {
                const tensor = await ImageUtils.fileToTensor(file);
                this.trainingData[category].push(tensor);

                // Crear preview
                const previewImg = ImageUtils.createPreviewImage(file);
                this.uiManager.addImageToPreview(previewId, previewImg);

                console.log(`Imagen ${file.name} procesada exitosamente`);
            } catch (error) {
                console.error('Error procesando imagen:', error);
            }
        }

        // Actualizar contador y verificar si está listo para entrenar
        this.uiManager.updateImageCount(countId, this.trainingData[category].length);
        this.checkTrainingReady();
    }

    /**
     * Verifica si hay suficientes datos para entrenar
     */
    checkTrainingReady() {
        const totalImages = Object.values(this.trainingData)
            .reduce((sum, category) => sum + category.length, 0);
        
        const hasEnoughData = Object.values(this.trainingData)
            .every(category => category.length >= CONFIG.MODEL.MIN_IMAGES_PER_CLASS);

        this.uiManager.updateTrainingButton(hasEnoughData, totalImages);
    }

    /**
     * Prepara los datos de entrenamiento
     */
    prepareTrainingData() {
        const xs = [];
        const ys = [];

        // Preparar datos con one-hot encoding
        const categories = ['red', 'gray', 'blue'];
        categories.forEach((category, categoryIndex) => {
            this.trainingData[category].forEach(tensor => {
                xs.push(tensor);
                const oneHot = new Array(CONFIG.MODEL.CLASSES.length).fill(0);
                oneHot[categoryIndex] = 1;
                ys.push(oneHot);
            });
        });

        console.log(`Total de imágenes preparadas: ${xs.length}`);

        // Mezclar datos
        const indices = ImageUtils.shuffleArray(Array.from({length: xs.length}, (_, i) => i));
        
        const shuffledXs = indices.map(i => xs[i]);
        const shuffledYs = indices.map(i => ys[i]);

        // Crear tensores finales
        const xTensor = tf.stack(shuffledXs);
        const yTensor = tf.tensor2d(shuffledYs);

        console.log(`Forma del tensor X: ${xTensor.shape}`);
        console.log(`Forma del tensor Y: ${yTensor.shape}`);

        return { x: xTensor, y: yTensor };
    }

    /**
     * Inicia el proceso de entrenamiento
     */
    async startTraining() {
        if (this.isTraining) {
            console.warn('Entrenamiento ya en progreso');
            return;
        }

        this.isTraining = true;
        
        try {
            this.uiManager.showProgressSection();
            this.uiManager.setTrainingInProgress(true);

            await MemoryUtils.withMemoryManagement(async () => {
                // Crear modelo
                this.model = ModelFactory.createMainModel();

                // Preparar datos
                const trainingData = this.prepareTrainingData();

                // Configurar entrenamiento
                const epochs = CONFIG.TRAINING.DEFAULT_EPOCHS;
                const batchSize = CONFIG.TRAINING.DEFAULT_BATCH_SIZE;

                console.log(`Iniciando entrenamiento: ${epochs} épocas, batch size: ${batchSize}`);

                // Callbacks de progreso
                const callbacks = ModelFactory.createTrainingCallbacks(epochs, (metrics) => {
                    this.uiManager.updateTrainingProgress(metrics);
                });

                // Entrenar modelo
                await this.model.fit(trainingData.x, trainingData.y, {
                    epochs: epochs,
                    batchSize: batchSize,
                    validationSplit: CONFIG.TRAINING.VALIDATION_SPLIT,
                    shuffle: true,
                    callbacks: callbacks
                });

                // Guardar modelo
                const savedLocation = await StorageUtils.saveModel(this.model);
                console.log(`Modelo guardado en: ${savedLocation}`);

                // Actualizar UI
                this.uiManager.showModelSection();
                this.uiManager.setTrainingCompleted();

                // Limpiar datos de entrenamiento
                trainingData.x.dispose();
                trainingData.y.dispose();
                this.cleanupTrainingData();

            }, 'entrenamiento del modelo');

        } catch (error) {
            console.error('Error durante el entrenamiento:', error);
            this.uiManager.setTrainingError(error.message);
        } finally {
            this.isTraining = false;
            this.uiManager.setTrainingInProgress(false);
        }
    }

    /**
     * Limpia los datos de entrenamiento para liberar memoria
     */
    cleanupTrainingData() {
        Object.values(this.trainingData).forEach(category => {
            MemoryUtils.disposeTensors(category);
        });
        
        this.trainingData = { red: [], gray: [], blue: [] };
        console.log('Datos de entrenamiento limpiados');
    }

    /**
     * Descarga el modelo entrenado
     */
    async downloadModel() {
        if (!this.model) {
            alert('No hay modelo entrenado para descargar');
            return;
        }

        try {
            await StorageUtils.downloadModel(this.model);
            alert('Modelo descargado exitosamente!');
        } catch (error) {
            console.error('Error descargando modelo:', error);
            alert('Error al descargar el modelo: ' + error.message);
        }
    }

    /**
     * Redirige a la página de pruebas
     */
    redirectToTest() {
        if (StorageUtils.hasTrainedModel()) {
            window.location.href = 'index.html';
        } else {
            alert('Primero debes entrenar un modelo');
        }
    }
}
