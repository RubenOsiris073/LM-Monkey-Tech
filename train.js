// Sistema de entrenamiento de modelo personalizado para clasificación de camisas
class ShirtModelTrainer {
    constructor() {
        this.model = null;
        this.trainingData = {
            red: [],
            gray: [],
            blue: []
        };
        this.imageSize = 32; // Reducido aún más para evitar problemas de memoria
        this.classes = ['roja', 'gris', 'azul'];
        
        // Configurar TensorFlow.js para usar CPU y evitar problemas de WebGL
        this.initializeTensorFlow();
        this.initializeEventListeners();
    }
    
    async initializeTensorFlow() {
        try {
            // Forzar uso de CPU para evitar problemas de WebGL en entornos limitados
            await tf.setBackend('cpu');
            console.log('TensorFlow.js configurado para usar CPU');
        } catch (error) {
            console.warn('No se pudo configurar backend CPU, usando default:', error);
        }
    }
    
    initializeEventListeners() {
        // Verificar que los elementos existen
        const redShirts = document.getElementById('redShirts');
        const grayShirts = document.getElementById('grayShirts');
        const blueShirts = document.getElementById('blueShirts');
        const trainButton = document.getElementById('trainButton');
        
        if (!redShirts || !grayShirts || !blueShirts || !trainButton) {
            console.error('No se encontraron algunos elementos HTML necesarios');
            return;
        }
        
        console.log('Inicializando event listeners...');
        
        // Event listeners para cargar imágenes
        redShirts.addEventListener('change', (e) => 
            this.handleImageUpload(e, 'red', 'redPreview', 'redCount'));
        grayShirts.addEventListener('change', (e) => 
            this.handleImageUpload(e, 'gray', 'grayPreview', 'grayCount'));
        blueShirts.addEventListener('change', (e) => 
            this.handleImageUpload(e, 'blue', 'bluePreview', 'blueCount'));
        
        // Botón de entrenamiento
        trainButton.addEventListener('click', () => this.startTraining());
        
        // Botones del modelo (verificar si existen)
        const downloadBtn = document.getElementById('downloadModel');
        const testBtn = document.getElementById('testModel');
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadModel());
        }
        if (testBtn) {
            testBtn.addEventListener('click', () => this.redirectToTest());
        }
        
        console.log('Event listeners inicializados correctamente');
    }
    
    async handleImageUpload(event, category, previewId, countId) {
        const files = Array.from(event.target.files);
        const preview = document.getElementById(previewId);
        const count = document.getElementById(countId);
        
        console.log(`Cargando ${files.length} imágenes para categoría: ${category}`);
        
        // Limpiar preview anterior
        preview.innerHTML = '';
        this.trainingData[category] = [];
        
        for (let file of files) {
            try {
                console.log(`Procesando archivo: ${file.name}`);
                const tensor = await this.fileToTensor(file);
                this.trainingData[category].push(tensor);
                
                // Crear preview de imagen
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.className = 'preview-img';
                preview.appendChild(img);
                
                console.log(`Imagen ${file.name} procesada exitosamente`);
                
            } catch (error) {
                console.error('Error procesando imagen:', error);
            }
        }
        
        count.textContent = `${this.trainingData[category].length} imágenes`;
        console.log(`Total de imágenes en ${category}:`, this.trainingData[category].length);
        this.checkTrainingReady();
    }
    
    async fileToTensor(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = this.imageSize;
                    canvas.height = this.imageSize;
                    
                    // Dibujar imagen redimensionada
                    ctx.drawImage(img, 0, 0, this.imageSize, this.imageSize);
                    
                    // Convertir a tensor sin expandDims extra
                    const tensor = tf.browser.fromPixels(canvas)
                        .div(255.0); // Solo normalizar, sin expandDims
                    
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
    
    checkTrainingReady() {
        const totalImages = this.trainingData.red.length + 
                          this.trainingData.gray.length + 
                          this.trainingData.blue.length;
        
        const minImagesPerClass = 3; // Reducido a 3 imágenes mínimo
        const hasEnoughData = this.trainingData.red.length >= minImagesPerClass &&
                             this.trainingData.gray.length >= minImagesPerClass &&
                             this.trainingData.blue.length >= minImagesPerClass;
        
        document.getElementById('trainButton').disabled = !hasEnoughData;
        
        if (hasEnoughData) {
            document.getElementById('trainButton').textContent = 
                `🚀 Entrenar Modelo (${totalImages} imágenes)`;
        } else {
            document.getElementById('trainButton').textContent = 
                `🚀 Entrenar Modelo (Necesitas al menos ${minImagesPerClass} por clase)`;
        }
    }
    
    async createModel() {
        console.log('Creando modelo ultra-optimizado...');
        
        // Modelo extremadamente simple para evitar problemas de memoria
        const model = tf.sequential({
            layers: [
                // Solo una capa convolucional muy pequeña
                tf.layers.conv2d({
                    inputShape: [this.imageSize, this.imageSize, 3],
                    filters: 4, // Solo 4 filtros
                    kernelSize: 5, // Kernel más grande para capturar features
                    activation: 'relu'
                }),
                tf.layers.maxPooling2d({ poolSize: 4 }), // Pooling agresivo
                
                // Directamente a clasificación
                tf.layers.flatten(),
                tf.layers.dense({
                    units: 8, // Solo 8 neuronas
                    activation: 'relu'
                }),
                tf.layers.dense({
                    units: 3, // 3 clases: roja, gris, azul
                    activation: 'softmax'
                })
            ]
        });
        
        // Compilar con configuración muy simple
        model.compile({
            optimizer: tf.train.adam(0.01), // Learning rate más alto para convergencia rápida
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        console.log('Modelo ultra-optimizado creado. Parámetros:', model.countParams());
        return model;
    }
    
    async createCompactModel() {
        console.log('Creando modelo ultra-compacto...');
        
        // Modelo extremadamente pequeño para localStorage
        const model = tf.sequential({
            layers: [
                tf.layers.conv2d({
                    inputShape: [this.imageSize, this.imageSize, 3],
                    filters: 2, // Solo 2 filtros
                    kernelSize: 8, // Kernel grande
                    activation: 'relu'
                }),
                tf.layers.maxPooling2d({ poolSize: 8 }), // Pooling muy agresivo
                
                tf.layers.flatten(),
                tf.layers.dense({
                    units: 4, // Solo 4 neuronas
                    activation: 'relu'
                }),
                tf.layers.dense({
                    units: 3,
                    activation: 'softmax'
                })
            ]
        });
        
        model.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        console.log('Modelo ultra-compacto creado. Parámetros:', model.countParams());
        return model;
    }
    
    prepareTrainingData() {
        const xs = [];
        const ys = [];
        
        // Preparar datos de entrenamiento
        this.trainingData.red.forEach(tensor => {
            xs.push(tensor); // No usar squeeze aquí
            ys.push([1, 0, 0]); // One-hot encoding para roja
        });
        
        this.trainingData.gray.forEach(tensor => {
            xs.push(tensor); // No usar squeeze aquí
            ys.push([0, 1, 0]); // One-hot encoding para gris
        });
        
        this.trainingData.blue.forEach(tensor => {
            xs.push(tensor); // No usar squeeze aquí
            ys.push([0, 0, 1]); // One-hot encoding para azul
        });
        
        console.log(`Total de imágenes: ${xs.length}`);
        console.log(`Forma de la primera imagen:`, xs[0].shape);
        
        // Convertir a tensores usando stack
        const xTensor = tf.stack(xs);
        const yTensor = tf.tensor2d(ys);
        
        console.log(`Forma del tensor X:`, xTensor.shape);
        console.log(`Forma del tensor Y:`, yTensor.shape);
        
        // Crear índices y mezclarlos manualmente
        const numSamples = xs.length;
        const indices = Array.from({length: numSamples}, (_, i) => i);
        
        // Mezclar los índices usando Fisher-Yates shuffle
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        // Crear tensores mezclados
        const shuffledXs = [];
        const shuffledYs = [];
        
        indices.forEach(index => {
            shuffledXs.push(xs[index]);
            shuffledYs.push(ys[index]);
        });
        
        const shuffledXTensor = tf.stack(shuffledXs);
        const shuffledYTensor = tf.tensor2d(shuffledYs);
        
        // Limpiar tensores temporales
        xTensor.dispose();
        yTensor.dispose();
        
        return { x: shuffledXTensor, y: shuffledYTensor };
    }
    
    async startTraining() {
        try {
            document.getElementById('progressSection').style.display = 'block';
            document.getElementById('trainButton').disabled = true;
            document.getElementById('trainButton').textContent = '🔄 Entrenando...';
            
            // Limpiar memoria antes de empezar
            if (tf.memory) {
                console.log('Memoria antes del entrenamiento:', tf.memory());
            }
            
            // Crear modelo
            this.model = await this.createModel();
            
            // Preparar datos
            const trainingData = this.prepareTrainingData();
            
            // Configuración de entrenamiento muy conservadora
            const epochs = 5; // Reducido drásticamente
            const batchSize = 2; // Batch size muy pequeño
            
            console.log(`Iniciando entrenamiento: ${epochs} épocas, batch size: ${batchSize}`);
            
            // Callbacks para mostrar progreso
            const callbacks = {
                onEpochEnd: (epoch, logs) => {
                    const progress = ((epoch + 1) / epochs) * 100;
                    document.getElementById('progressFill').style.width = `${progress}%`;
                    document.getElementById('progressText').textContent = 
                        `Época ${epoch + 1}/${epochs}`;
                    
                    document.getElementById('metricsDisplay').innerHTML = `
                        <div class="metrics">
                            <span>Pérdida: ${logs.loss.toFixed(4)}</span>
                            <span>Precisión: ${(logs.acc * 100).toFixed(2)}%</span>
                        </div>
                    `;
                    
                    console.log(`Época ${epoch + 1}/${epochs} - Loss: ${logs.loss.toFixed(4)}, Accuracy: ${logs.acc.toFixed(4)}`);
                    
                    // Liberar memoria después de cada época
                    if (tf.memory) {
                        console.log('Memoria después de época:', tf.memory());
                    }
                }
            };
            
            // Entrenar modelo con configuración muy conservadora
            await this.model.fit(trainingData.x, trainingData.y, {
                epochs: epochs,
                batchSize: batchSize,
                validationSplit: 0.1, // Menos datos para validación
                shuffle: true,
                callbacks: callbacks
            });
            
            console.log('Entrenamiento completado, guardando modelo...');
            
            // Guardar modelo usando IndexedDB (más capacidad que localStorage)
            try {
                await this.model.save('indexeddb://shirt-classifier-model');
                localStorage.setItem('hasTrainedModel', 'true');
                localStorage.setItem('modelLocation', 'indexeddb');
                console.log('✅ Modelo guardado en IndexedDB');
            } catch (saveError) {
                console.warn('No se pudo guardar en IndexedDB, intentando localStorage reducido...');
                try {
                    // Crear versión más pequeña del modelo para localStorage
                    const compactModel = await this.createCompactModel();
                    await compactModel.save('localstorage://shirt-classifier-compact');
                    localStorage.setItem('hasTrainedModel', 'true');
                    localStorage.setItem('modelLocation', 'localstorage');
                    console.log('✅ Modelo compacto guardado en localStorage');
                    compactModel.dispose();
                } catch (compactError) {
                    console.error('Error guardando modelo:', compactError);
                    alert('Modelo entrenado pero no se pudo guardar. Puedes descargarlo manualmente.');
                }
            }
            
            // Mostrar sección del modelo entrenado
            document.getElementById('modelSection').style.display = 'block';
            document.getElementById('progressText').textContent = '✅ Entrenamiento completado y modelo guardado!';
            
            console.log('✅ Modelo entrenado y guardado exitosamente');
            
            // Limpiar datos de entrenamiento para liberar memoria
            trainingData.x.dispose();
            trainingData.y.dispose();
            
            // Limpiar tensores de entrenamiento individuales
            this.trainingData.red.forEach(tensor => tensor.dispose());
            this.trainingData.gray.forEach(tensor => tensor.dispose());
            this.trainingData.blue.forEach(tensor => tensor.dispose());
            
            // Reiniciar arrays
            this.trainingData = { red: [], gray: [], blue: [] };
            
            // Reporte final de memoria
            if (tf.memory) {
                console.log('Memoria final:', tf.memory());
            }
            
        } catch (error) {
            console.error('Error durante el entrenamiento:', error);
            this.updateModelStatus('Error en el entrenamiento');
            alert('Error durante el entrenamiento: ' + error.message);
        } finally {
            // Rehabilitar botón
            document.getElementById('trainButton').disabled = false;
            document.getElementById('trainButton').textContent = '🚀 Entrenar Modelo';
        }
    }
    
    updateModelStatus(message) {
        console.log('Estado del modelo:', message);
        // Puedes agregar aquí lógica para mostrar el estado en la UI si necesitas
    }
    
    async downloadModel() {
        if (!this.model) {
            alert('No hay modelo entrenado para descargar');
            return;
        }
        
        try {
            await this.model.save('downloads://shirt-classifier-model');
            alert('Modelo descargado exitosamente!');
        } catch (error) {
            console.error('Error descargando modelo:', error);
            alert('Error al descargar el modelo');
        }
    }
    
    redirectToTest() {
        // Guardar modelo en localStorage para usarlo en la página de prueba
        if (this.model) {
            localStorage.setItem('hasTrainedModel', 'true');
            window.location.href = 'index.html';
        }
    }
}

// Inicializar cuando la página esté cargada
document.addEventListener('DOMContentLoaded', () => {
    new ShirtModelTrainer();
});
