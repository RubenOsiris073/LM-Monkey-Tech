'use client';

import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface Prediction {
  className: string;
  confidence: number;
}

interface ClassificationResultsProps {
  predictions: Prediction[];
  isClassifying: boolean;
}

export default function ClassificationResults({
  predictions,
  isClassifying
}: ClassificationResultsProps) {
  
  // Obtener color según confianza
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Resultados de clasificación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-primary"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados</h2>
        
        {isClassifying ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Analizando imagen...</span>
          </div>
        ) : predictions.length > 0 ? (
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {index + 1}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {prediction.className}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Sube una imagen y haz clic en "Clasificar" para ver los resultados</p>
          </div>
        )}
      </motion.div>

      {/* Información de confianza */}
      {predictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-warning"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Interpretación</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">
                <strong>Alta confianza (≥80%)</strong>: Predicción muy confiable
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">
                <strong>Media confianza (60-79%)</strong>: Predicción moderadamente confiable
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">
                <strong>Baja confianza (&lt;60%)</strong>: Predicción poco confiable
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
