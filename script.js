// Clasificador de Camisas con TensorFlow.js
class ShirtClassifier {
    constructor() {
        this.customModel = null;
        this.mobilenetModel = null;
        this.currentModel = 'custom';
        this.classes = ['roja', 'gris', 'azul'];
        this.imageSize = 32; // Debe coincidir con el tamaño usado en el entrenamiento
        
        this.initializeApp();
    }
    
    async initializeApp() {
        // Configurar TensorFlow.js para usar CPU y evitar problemas de WebGL
        try {
            await tf.setBackend('cpu');
            console.log('TensorFlow.js configurado para usar CPU');
        } catch (error) {
            console.warn('No se pudo configurar backend CPU, usando default:', error);
        }
        
        this.setupEventListeners();
        await this.checkForSavedModel();
        this.updateModelStatus('Listo para clasificar');
    }
    
    setupEventListeners() {
        // Elementos del DOM
        const imageInput = document.getElementById('imageInput');
        const dropZone = document.getElementById('dropZone');
        const analyzeButton = document.getElementById('analyzeButton');
        const loadModelBtn = document.getElementById('loadModelBtn');
        const modelLoader = document.getElementById('modelLoader');
        const modelRadios = document.querySelectorAll('input[name="modelType"]');
        
        // Event listeners
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        analyzeButton.addEventListener('click', () => this.classifyImage());
        loadModelBtn.addEventListener('click', () => modelLoader.click());
        modelLoader.addEventListener('change', (e) => this.loadCustomModel(e));
        
        // Drag and drop
        dropZone.addEventListener('dragover', this.handleDragOver);
        dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        dropZone.addEventListener('click', () => imageInput.click());
        
        // Cambio de modelo
        modelRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.switchModel(e.target.value));
        });
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));
        
        if (imageFile) {
            this.displayImage(imageFile);
        }
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.displayImage(file);
        }
    }
    
    displayImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('selectedImage');
            img.src = e.target.result;
            img.onload = () => {
                document.getElementById('imagePreview').style.display = 'block';
                document.getElementById('results').style.display = 'none';
                
                // Habilitar/deshabilitar botón según modelo disponible
                const analyzeButton = document.getElementById('analyzeButton');
                const hasModel = (this.currentModel === 'custom' && this.customModel) || 
                                (this.currentModel === 'mobilenet' && this.mobilenetModel);
                analyzeButton.disabled = !hasModel;
                
                if (!hasModel) {
                    analyzeButton.textContent = '⚠️ Sin modelo disponible';
                } else {
                    analyzeButton.textContent = '🔍 Clasificar Camisa';
                }
            };
        };
        reader.readAsDataURL(file);
    }
    
    async switchModel(modelType) {
        this.currentModel = modelType;
        
        if (modelType === 'mobilenet' && !this.mobilenetModel) {
            this.updateModelStatus('Cargando MobileNet...');
            try {
                // Simular carga de MobileNet (en un caso real cargarías el modelo real)
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
    
    async checkForSavedModel() {
        // Verificar si hay un modelo en IndexedDB o localStorage
        try {
            const modelLocation = localStorage.getItem('modelLocation');
            
            if (modelLocation === 'indexeddb') {
                console.log('Intentando cargar modelo desde IndexedDB...');
                const savedModel = await tf.loadLayersModel('indexeddb://shirt-classifier-model');
                if (savedModel) {
                    this.customModel = savedModel;
                    this.updateModelStatus('✅ Modelo personalizado cargado desde IndexedDB');
                    return;
                }
            } else if (modelLocation === 'localstorage') {
                console.log('Intentando cargar modelo compacto desde localStorage...');
                const savedModel = await tf.loadLayersModel('localstorage://shirt-classifier-compact');
                if (savedModel) {
                    this.customModel = savedModel;
                    this.updateModelStatus('✅ Modelo compacto cargado desde localStorage');
                    return;
                }
            }
            
            // Intentar localStorage con nombre original como fallback
            const savedModel = await tf.loadLayersModel('localstorage://shirt-classifier-model');
            if (savedModel) {
                this.customModel = savedModel;
                this.updateModelStatus('✅ Modelo personalizado cargado desde localStorage');
                return;
            }
            
        } catch (error) {
            console.log('No se encontró modelo guardado:', error.message);
        }
        
        // Verificar si viene de entrenamiento
        if (localStorage.getItem('hasTrainedModel') === 'true') {
            this.updateModelStatus('⚠️ Modelo entrenado pero no cargado - Recarga la página');
        } else {
            this.updateModelStatus('❌ Sin modelo personalizado - Entrenar primero');
            // Deshabilitar el botón de análisis
            const analyzeButton = document.getElementById('analyzeButton');
            if (analyzeButton) {
                analyzeButton.disabled = true;
            }
        }
    }
    
    async loadCustomModel(event) {
        const files = Array.from(event.target.files);
        const modelFile = files.find(file => file.name.includes('model.json'));
        
        if (modelFile) {
            try {
                this.updateModelStatus('Cargando modelo personalizado...');
                
                // Crear URLs para los archivos
                const modelUrl = URL.createObjectURL(modelFile);
                this.customModel = await tf.loadLayersModel(modelUrl);
                
                this.updateModelStatus('Modelo personalizado cargado exitosamente');
                
                // Cambiar a modelo personalizado
                document.querySelector('input[value="custom"]').checked = true;
                this.currentModel = 'custom';
                
            } catch (error) {
                console.error('Error cargando modelo:', error);
                this.updateModelStatus('Error cargando modelo personalizado');
            }
        }
    }
    
    updateModelStatus(message) {
        const statusElement = document.getElementById('modelStatus');
        const spinner = statusElement.querySelector('.spinner');
        const text = statusElement.querySelector('span');
        
        text.textContent = message;
        
        if (message.includes('Cargando') || message.includes('Preparando')) {
            spinner.style.display = 'inline-block';
        } else {
            spinner.style.display = 'none';
        }
    }
    
    async classifyImage() {
        const img = document.getElementById('selectedImage');
        if (!img.src) return;
        
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
    
    async classifyWithCustomModel(imgElement) {
        // Preprocesar imagen para el modelo personalizado
        const tensor = tf.browser.fromPixels(imgElement)
            .resizeNearestNeighbor([this.imageSize, this.imageSize])
            .toFloat()
            .div(255.0)
            .expandDims(0);
        
        // Hacer predicción
        const prediction = this.customModel.predict(tensor);
        const probabilities = await prediction.data();
        
        // Crear resultados
        const results = this.classes.map((className, index) => ({
            className: `Camisa ${className}`,
            probability: probabilities[index]
        }));
        
        // Limpiar tensores
        tensor.dispose();
        prediction.dispose();
        
        return results.sort((a, b) => b.probability - a.probability);
    }
    
    async classifyWithMobileNet(imgElement) {
        // Simulación de clasificación con MobileNet
        // En un caso real, usarías el modelo real de MobileNet
        const mockResults = [
            { className: 'Jersey/Camiseta', probability: Math.random() * 0.6 + 0.3 },
            { className: 'Polo shirt', probability: Math.random() * 0.4 + 0.1 },
            { className: 'Sweatshirt', probability: Math.random() * 0.3 + 0.05 },
            { className: 'Cardigan', probability: Math.random() * 0.2 + 0.02 },
            { className: 'T-shirt', probability: Math.random() * 0.15 + 0.01 }
        ];
        
        return mockResults.sort((a, b) => b.probability - a.probability);
    }
    
    displayResults(predictions) {
        const resultsDiv = document.getElementById('results');
        const predictionsDiv = document.getElementById('predictions');
        
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

// Funciones de utilidad para entrenar
class TrainingUtils {
    static async createDataset(imageFiles, labels) {
        const images = [];
        const labelTensors = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
            const tensor = await TrainingUtils.fileToTensor(imageFiles[i]);
            images.push(tensor);
            labelTensors.push(labels[i]);
        }
        
        return {
            images: tf.concat(images),
            labels: tf.tensor2d(labelTensors)
        };
    }
    
    static async fileToTensor(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = 224;
                canvas.height = 224;
                ctx.drawImage(img, 0, 0, 224, 224);
                
                const tensor = tf.browser.fromPixels(canvas)
                    .div(255.0)
                    .expandDims(0);
                
                resolve(tensor);
            };
            img.src = URL.createObjectURL(file);
        });
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new ShirtClassifier();
});
