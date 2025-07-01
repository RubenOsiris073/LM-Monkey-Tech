'use client';

import { motion } from 'framer-motion';
import { Download, Trash2, Brain, Calendar, Copy } from 'lucide-react';
import { SavedModel } from '../types';

interface ModelCardProps {
  model: SavedModel;
  index: number;
  onExport: (model: SavedModel) => void;
  onDelete: (model: SavedModel) => void;
  onCopyName: (modelName: string) => void;
}

export default function ModelCard({ model, index, onExport, onDelete, onCopyName }: ModelCardProps) {
  return (
    <motion.div
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
          onClick={() => onCopyName(model.name)}
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
          onClick={() => onExport(model)}
          className="btn-secondary flex-1 flex items-center justify-center space-x-1 text-sm"
        >
          <Download className="w-3 h-3" />
          <span>Descargar</span>
        </button>
        
        <button
          onClick={() => onDelete(model)}
          className="btn-danger p-2"
          title="Eliminar modelo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
