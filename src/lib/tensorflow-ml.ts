/**
 * Implementación real de TensorFlow.js para entrenamiento y clasificación
 * Este archivo contiene la lógica ML real que se integrará una vez resueltos
 * los problemas de compatibilidad con Next.js
 */

import * as tf from '@tensorflow/tfjs';

// Configuración para TensorFlow.js en el servidor
export async function initializeTensorFlow() {
  if (typeof window === 'undefined') {
    // En el servidor, cargar el backend de Node.js
    await import('@tensorflow/tfjs-node');
    console.log('TensorFlow.js configurado para Node.js');
  } else {
    // En el cliente, usar el backend WebGL
    await tf.ready();
    console.log('TensorFlow.js configurado para el navegador');
  }
}

// Crear modelo CNN para clasificación de imágenes
export function createCNNModel(numClasses: number): tf.LayersModel {
  const model = tf.sequential({
    layers: [
      // Primera capa convolucional
      tf.layers.conv2d({
        inputShape: [224, 224, 3],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
      }),
      tf.layers.batchNormalization(),
      tf.layers.maxPooling2d({ poolSize: 2 }),
      
      // Segunda capa convolucional
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
      }),
      tf.layers.batchNormalization(),
      tf.layers.maxPooling2d({ poolSize: 2 }),
      
      // Tercera capa convolucional
      tf.layers.conv2d({
        filters: 128,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
      }),
      tf.layers.batchNormalization(),
      tf.layers.maxPooling2d({ poolSize: 2 }),
      
      // Cuarta capa convolucional
      tf.layers.conv2d({
        filters: 256,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
      }),
      tf.layers.batchNormalization(),
      tf.layers.globalAveragePooling2d({}),
      
      // Capas densas
      tf.layers.dropout({ rate: 0.5 }),
      tf.layers.dense({
        units: 128,
        activation: 'relu'
      }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({
        units: numClasses,
        activation: 'softmax'
      })
    ]
  });

  // Compilar modelo
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

// Preprocesar imagen para entrenamiento/clasificación
export async function preprocessImage(imageBase64: string): Promise<tf.Tensor3D> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Crear canvas para redimensionar
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 224;
      canvas.height = 224;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, 224, 224);
      
      // Convertir a tensor
      const tensor = tf.browser.fromPixels(canvas)
        .div(255.0) as tf.Tensor3D;
      
      resolve(tensor);
    };
    
    img.onerror = () => reject(new Error('Error cargando imagen'));
    img.src = imageBase64;
  });
}

// Preprocesar imagen en el servidor usando Sharp
export async function preprocessImageServer(imageBuffer: Buffer): Promise<tf.Tensor3D> {
  const sharp = await import('sharp');
  
  // Procesar imagen con Sharp
  const processedImage = await sharp.default(imageBuffer)
    .resize(224, 224)
    .removeAlpha()
    .raw()
    .toBuffer();

  // Convertir a tensor
  const tensor = tf.tensor3d(
    new Uint8Array(processedImage),
    [224, 224, 3]
  ).div(255.0) as tf.Tensor3D;

  return tensor;
}

// Preparar datos de entrenamiento
export async function prepareTrainingData(
  classes: { name: string; images: string[] }[]
): Promise<{ images: tf.Tensor4D; labels: tf.Tensor2D }> {
  const images: tf.Tensor3D[] = [];
  const labels: number[] = [];

  for (let classIndex = 0; classIndex < classes.length; classIndex++) {
    const classData = classes[classIndex];
    
    for (const imageBase64 of classData.images) {
      try {
        let tensor: tf.Tensor3D;
        
        if (typeof window === 'undefined') {
          // En el servidor
          const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');
          tensor = await preprocessImageServer(imageBuffer);
        } else {
          // En el cliente
          tensor = await preprocessImage(imageBase64);
        }

        images.push(tensor);
        labels.push(classIndex);
      } catch (error) {
        console.error('Error procesando imagen:', error);
      }
    }
  }

  // Convertir a tensores
  const imagesTensor = tf.stack(images) as tf.Tensor4D;
  const labelsTensor = tf.oneHot(labels, classes.length) as tf.Tensor2D;

  // Limpiar tensores temporales
  images.forEach(tensor => tensor.dispose());

  return { images: imagesTensor, labels: labelsTensor };
}

// Entrenar modelo
export async function trainModel(
  model: tf.LayersModel,
  images: tf.Tensor4D,
  labels: tf.Tensor2D,
  onEpochEnd?: (epoch: number, logs: any) => void
): Promise<tf.History> {
  const history = await model.fit(images, labels, {
    epochs: 20,
    batchSize: 16,
    validationSplit: 0.2,
    shuffle: true,
    verbose: 1,
    callbacks: onEpochEnd ? {
      onEpochEnd: (epoch, logs) => onEpochEnd(epoch, logs)
    } : undefined
  });

  return history;
}

// Clasificar imagen
export async function classifyImage(
  model: tf.LayersModel,
  image: tf.Tensor3D,
  classNames: string[]
): Promise<{ className: string; confidence: number }[]> {
  // Expandir dimensiones para batch
  const batchedImage = image.expandDims(0) as tf.Tensor4D;
  
  // Realizar predicción
  const predictions = model.predict(batchedImage) as tf.Tensor2D;
  const probabilidades = await predictions.data();
  
  // Crear resultados
  const results = classNames.map((className, index) => ({
    className,
    confidence: probabilidades[index]
  }));

  // Limpiar tensores
  batchedImage.dispose();
  predictions.dispose();
  image.dispose();

  // Ordenar por confianza
  return results.sort((a, b) => b.confidence - a.confidence);
}

// Guardar modelo
export async function saveModel(model: tf.LayersModel, name: string): Promise<string> {
  if (typeof window === 'undefined') {
    // En el servidor, guardar en el sistema de archivos
    const modelPath = `/tmp/models/${name}`;
    await model.save(`file://${modelPath}`);
    return modelPath;
  } else {
    // En el cliente, guardar en localStorage o IndexedDB
    await model.save(`localstorage://${name}`);
    return name;
  }
}

// Cargar modelo
export async function loadModel(path: string): Promise<tf.LayersModel> {
  if (typeof window === 'undefined') {
    // En el servidor
    return await tf.loadLayersModel(`file://${path}/model.json`);
  } else {
    // En el cliente
    return await tf.loadLayersModel(`localstorage://${path}`);
  }
}

// Serializar modelo para transferencia
export async function serializeModel(model: tf.LayersModel): Promise<{
  topology: any;
  weights: any;
}> {
  // Obtener topología del modelo
  const topology = model.toJSON();
  
  // Obtener pesos
  const weights = model.getWeights().map(tensor => ({
    shape: tensor.shape,
    data: Array.from(tensor.dataSync())
  }));

  return { topology, weights };
}

// Deserializar modelo
export async function deserializeModel(serialized: {
  topology: any;
  weights: any;
}): Promise<tf.LayersModel> {
  // Crear modelo desde topología
  const model = await tf.models.modelFromJSON(serialized.topology);
  
  // Restaurar pesos
  const weights = serialized.weights.map((w: any) => 
    tf.tensor(w.data, w.shape)
  );
  
  model.setWeights(weights);
  
  return model;
}
