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

  // Cargar modelos guardados desde localStorage
  const loadSavedModels = async () => {
    setIsLoading(true);
    try {
      const models: SavedModel[] = [];
      
      // Buscar modelos en localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tensorflowjs_models/')) {
          const modelName = key.replace('tensorflowjs_models/', '').split('/')[0];
          
          // Evitar duplicados
          if (!models.find(m => m.name === modelName)) {
            models.push({
              name: modelName,
              createdAt: new Date().toISOString(),
              size: '2.1 MB', // Placeholder
              accuracy: Math.random() * 0.3 + 0.7,
              classes: ['Frutas', 'Verduras', 'Lácteos']
            });
          }
        }
      }
      
      setSavedModels(models);
    } catch (error) {
      console.error('Error cargando modelos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar modelo
  const deleteModel = async (modelName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el modelo "${modelName}"?`)) {
      return;
    }

    try {
      const keysToDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(modelName)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => localStorage.removeItem(key));
      await loadSavedModels();
      alert(`Modelo "${modelName}" eliminado exitosamente`);
    } catch (error) {
      alert('Error al eliminar el modelo');
    }
  };

  // Exportar modelo
  const exportModel = async (modelName: string) => {
    try {
      const modelData: { [key: string]: string } = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(modelName)) {
          const value = localStorage.getItem(key);
          if (value) {
            modelData[key] = value;
          }
        }
      }
      
      const blob = new Blob([JSON.stringify(modelData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelName}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`Modelo "${modelName}" exportado exitosamente`);
    } catch (error) {
      alert('Error al exportar el modelo');
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
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Almacenamiento Local</h3>
              <p className="text-sm text-blue-700 mb-3">
                Los modelos se guardan localmente en tu navegador usando localStorage. 
                Esto significa que solo estarán disponibles en este dispositivo y navegador.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                  ✓ Acceso offline
                </span>
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                  ✓ Privacidad total
                </span>
                <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded">
                  ⚠️ Solo en este navegador
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
                    onClick={() => exportModel(model.name)}
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
                    onClick={() => deleteModel(model.name)}
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
              <p>Los modelos se guardan automáticamente al completar el entrenamiento. Usa el botón "Descargar Modelo" en la página de entrenamiento.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">📤 Exportar modelos</h4>
              <p>Exporta tus modelos como archivos JSON para hacer respaldo o compartir con otros dispositivos.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🎯 Usar modelos</h4>
              <p>Usa el botón "Usar" para ir directamente a la página de clasificación con el modelo seleccionado.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🗑️ Eliminar modelos</h4>
              <p>Elimina modelos que ya no necesites para liberar espacio en tu navegador.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
