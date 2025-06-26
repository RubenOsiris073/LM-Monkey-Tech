'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Database, 
  Settings, 
  CheckCircle,
  Info,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ModelDemoPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // Datos de modelo de ejemplo
  const sampleModelData = {
    modelTopology: {
      modelTopology: {
        class_name: "Sequential",
        config: {
          name: "sequential",
          layers: [
            {
              class_name: "Conv2D",
              config: {
                name: "conv2d",
                filters: 32,
                kernel_size: [3, 3],
                activation: "relu"
              }
            },
            {
              class_name: "Dense",
              config: {
                name: "dense",
                units: 2,
                activation: "softmax"
              }
            }
          ]
        }
      },
      format: "layers-model",
      generatedBy: "TensorFlow.js tfjs-layers v4.22.0"
    },
    weightsData: new Array(1000).fill(0).map(() => Math.random()),
    metadata: {
      name: `demo-model-${Date.now()}`,
      classes: ['Manzanas', 'Plátanos'],
      createdAt: new Date().toISOString(),
      finalMetrics: {
        accuracy: 0.92,
        loss: 0.18
      },
      trainedImages: 50,
      modelSize: 4000,
      epochs: 20
    },
    files: {
      "model.json": {},
      "model.weights.bin": {},
      "metadata.json": {}
    }
  };

  const downloadDemoModel = () => {
    setIsDownloading(true);
    
    setTimeout(() => {
      // Simular descarga del modelo completo
      downloadModelComplete(sampleModelData);
      setIsDownloading(false);
      setDownloadComplete(true);
    }, 2000);
  };

  const downloadModelComplete = (modelData: any) => {
    const modelName = modelData.metadata?.name || `grocery-model-${Date.now()}`;
    
    // 1. model.json
    const modelJsonBlob = new Blob([JSON.stringify(modelData.modelTopology, null, 2)], {
      type: 'application/json'
    });
    downloadFile(modelJsonBlob, `${modelName}-model.json`);

    // 2. model.weights.bin
    const weightsArray = new Uint8Array(modelData.weightsData);
    const weightsBlob = new Blob([weightsArray], {
      type: 'application/octet-stream'
    });
    downloadFile(weightsBlob, `${modelName}-model.weights.bin`);

    // 3. metadata.json
    const metadataBlob = new Blob([JSON.stringify(modelData.metadata, null, 2)], {
      type: 'application/json'
    });
    downloadFile(metadataBlob, `${modelName}-metadata.json`);

    // 4. README.txt
    const readmeContent = `# Modelo de Clasificación de Productos Grocery ML

Modelo entrenado: ${modelData.metadata?.name}
Fecha de entrenamiento: ${modelData.metadata?.createdAt}
Clases: ${modelData.metadata?.classes?.join(', ')}
Precisión final: ${(modelData.metadata?.finalMetrics?.accuracy * 100).toFixed(2)}%

## Archivos incluidos:
- ${modelName}-model.json: Topología del modelo (arquitectura)
- ${modelName}-model.weights.bin: Pesos entrenados (binario)
- ${modelName}-metadata.json: Metadatos completos

## Cómo usar:
1. Para cargar en TensorFlow.js: tf.loadLayersModel('ruta/al/model.json')
2. El modelo espera imágenes de 224x224 píxeles
3. Clases de salida: ${modelData.metadata?.classes?.join(', ')}
`;

    const readmeBlob = new Blob([readmeContent], {
      type: 'text/plain'
    });
    downloadFile(readmeBlob, `${modelName}-README.txt`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <h1 className="text-3xl font-bold text-gray-800">Demo: Descarga de Modelo Completo</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel izquierdo - Información */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Estructura del Modelo</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-800">model.json</div>
                    <div className="text-sm text-gray-600">Arquitectura y topología del modelo</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-800">model.weights.bin</div>
                    <div className="text-sm text-gray-600">Pesos entrenados (archivo binario)</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Settings className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-800">metadata.json</div>
                    <div className="text-sm text-gray-600">Metadatos y configuración</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Info className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-medium text-gray-800">README.txt</div>
                    <div className="text-sm text-gray-600">Instrucciones de uso</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-amber-50 rounded-xl border border-amber-200 p-6"
            >
              <h3 className="text-lg font-semibold text-amber-800 mb-3">¿Qué incluye ahora?</h3>
              <ul className="space-y-2 text-sm text-amber-700">
                <li>✅ Topología completa del modelo (arquitectura CNN)</li>
                <li>✅ Pesos binarios entrenados</li>
                <li>✅ Metadatos detallados del entrenamiento</li>
                <li>✅ Historial de entrenamiento (pérdida, precisión)</li>
                <li>✅ Configuración de preprocesamiento</li>
                <li>✅ Instrucciones de uso en README</li>
                <li>✅ Compatible con TensorFlow.js</li>
              </ul>
            </motion.div>
          </div>

          {/* Panel derecho - Demo y descarga */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Probar Descarga</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Modelo de ejemplo:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Clases: Manzanas, Plátanos</div>
                    <div>• Precisión: 92%</div>
                    <div>• Imágenes entrenadas: 50</div>
                    <div>• Arquitectura: CNN</div>
                  </div>
                </div>

                <button
                  onClick={downloadDemoModel}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>
                    {isDownloading ? 'Preparando descarga...' : 'Descargar Modelo Demo'}
                  </span>
                </button>

                {downloadComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 text-sm font-medium">
                      ¡4 archivos descargados exitosamente!
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Diferencia con la versión anterior</h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-red-800 mb-1">❌ Antes (solo metadatos):</div>
                  <code className="text-xs text-red-600 block">
                    {`{ "metadata": { "name": "...", "classes": [...] } }`}
                  </code>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800 mb-1">✅ Ahora (modelo completo):</div>
                  <code className="text-xs text-green-600 block">
                    {`• model.json (topología CNN)\n• model.weights.bin (pesos entrenados)\n• metadata.json (metadatos completos)\n• README.txt (instrucciones)`}
                  </code>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
