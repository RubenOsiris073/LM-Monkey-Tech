'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Trash2, 
  ArrowLeft, 
  Brain,
  Calendar,
  HardDrive,
  Copy,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface SavedModel {
  id?: string;
  name: string;
  createdAt: string;
  size: string;
  accuracy?: number;
  classes?: string[];
}

export default function ModelsPage() {
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedModels();
  }, []);

  // Cargar modelos guardados desde el servidor
  const loadSavedModels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const models: SavedModel[] = data.models.map((model: any) => ({
            name: model.name,
            createdAt: model.createdAt,
            size: `${(model.modelSize / 1024 / 1024).toFixed(1)} MB`,
            accuracy: model.accuracy,
            classes: model.classes,
            id: model.id // Agregar ID para operaciones
          }));
          setSavedModels(models);
        }
      } else {
        console.error('Error cargando modelos del servidor');
        setSavedModels([]);
      }
    } catch (error) {
      console.error('Error cargando modelos:', error);
      setSavedModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar modelo del servidor
  const deleteModel = async (model: SavedModel) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el modelo "${model.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/models?modelId=${model.id || model.name}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadSavedModels();
        alert(`Modelo "${model.name}" eliminado exitosamente`);
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar el modelo: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error eliminando modelo:', error);
      alert('Error al eliminar el modelo');
    }
  };

  // Exportar modelo desde el servidor
  const exportModel = async (model: SavedModel) => {
    try {
      const response = await fetch(`/api/models?modelId=${model.id || model.name}&download=true`);
      
      if (response.ok) {
        // Descargar el archivo ZIP
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${model.name}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`Modelo "${model.name}" descargado exitosamente`);
      } else {
        const errorData = await response.json();
        alert(`Error al descargar el modelo: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error descargando modelo:', error);
      alert('Error al descargar el modelo');
    }
  };

  // Copiar nombre del modelo
  const copyModelName = (modelName: string) => {
    navigator.clipboard.writeText(modelName);
    alert('Nombre del modelo copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-models">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Modelos</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {savedModels.length} modelo{savedModels.length !== 1 ? 's' : ''} guardado{savedModels.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={loadSavedModels}
              className="btn-primary flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Información de almacenamiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-info mb-8"
        >
          <div className="flex items-start space-x-3">
            <HardDrive className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Almacenamiento en Servidor</h3>
              <p className="text-sm text-blue-700 mb-3">
                Los modelos se guardan automáticamente en el servidor después del entrenamiento. 
                Están disponibles desde cualquier dispositivo y navegador.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                  ✓ Acceso desde cualquier dispositivo
                </span>
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                  ✓ Almacenamiento persistente
                </span>
                <span className="px-2 py-1 bg-green-200 text-green-800 rounded">
                  ✓ Guardado automático
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de modelos */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Cargando modelos...</span>
          </div>
        ) : savedModels.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-primary text-center"
          >
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay modelos guardados</h3>
            <p className="text-gray-600 mb-6">
              Entrena tu primer modelo para verlo aquí
            </p>
            <Link
              href="/train"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>Entrenar Modelo</span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedModels.map((model, index) => (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-primary hover:shadow-md transition-shadow"
              >
                {/* Header del modelo */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-800 truncate">
                      {model.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => copyModelName(model.name)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copiar nombre"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {/* Información del modelo */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tamaño:</span>
                    <span className="font-medium">{model.size}</span>
                  </div>
                  
                  {model.accuracy && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Precisión:</span>
                      <span className={`font-medium ${
                        model.accuracy >= 0.8 ? 'text-green-600' : 
                        model.accuracy >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(model.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(model.createdAt).toLocaleDateString()}</span>
                  </div>

                  {model.classes && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Clases:</span>
                      <div className="flex flex-wrap gap-1">
                        {model.classes.slice(0, 3).map((className, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {className}
                          </span>
                        ))}
                        {model.classes.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{model.classes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportModel(model)}
                    className="btn-secondary flex-1 flex items-center justify-center space-x-1 text-sm"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar</span>
                  </button>
                  
                  <Link
                    href="/classify"
                    className="btn-primary flex-1 flex items-center justify-center space-x-1 text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Usar</span>
                  </Link>
                  
                  <button
                    onClick={() => deleteModel(model)}
                    className="btn-danger p-2"
                    title="Eliminar modelo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Instrucciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-secondary mt-12"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cómo gestionar tus modelos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 font-medium">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">💾 Guardar modelos</h4>
              <p>Los modelos se guardan automáticamente en el servidor al completar el entrenamiento. Están disponibles inmediatamente en la página de modelos.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">📤 Descargar modelos</h4>
              <p>Descarga tus modelos como archivos ZIP completos con todos los archivos necesarios (model.json, weights.bin, metadata.json, README.txt).</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🎯 Usar modelos</h4>
              <p>Usa el botón "Usar" para ir directamente a la página de clasificación. Luego carga los archivos de tu modelo descargado.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🌐 Acceso universal</h4>
              <p>Accede a tus modelos desde cualquier dispositivo. Los modelos están disponibles en el servidor persistentemente.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
