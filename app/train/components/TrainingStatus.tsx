'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface TrainingStatusProps {
  classes: any[];
  totalImages: number;
  isTraining: boolean;
  trainingMetrics: any;
  onStartTraining: () => void;
  validateTrainingData: () => { valid: boolean; message: string };
}

export default function TrainingStatus({ 
  classes, 
  totalImages, 
  isTraining, 
  trainingMetrics, 
  onStartTraining, 
  validateTrainingData 
}: TrainingStatusProps) {
  const validation = validateTrainingData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado del Modelo</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Clases definidas:</span>
          <span className="font-semibold text-gray-900">{classes.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total de imágenes:</span>
          <span className="font-semibold text-gray-900">{totalImages}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Estado:</span>
          <span className={`font-semibold ${isTraining ? 'text-blue-600' : 'text-green-600'}`}>
            {isTraining ? 'Entrenando...' : 'Listo'}
          </span>
        </div>
      </div>

      {isTraining && (
        <div className="mt-4">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Progreso</span>
            <span className="text-blue-600">{trainingMetrics?.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${trainingMetrics?.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={onStartTraining}
        disabled={isTraining || !validation.valid}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play className="w-4 h-4" />
        <span>{isTraining ? 'Entrenando...' : 'Iniciar Entrenamiento'}</span>
      </button>

      {!validation.valid && (
        <p className="text-xs text-red-600 mt-2">
          {validation.message}
        </p>
      )}
      
      {isTraining && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Entrenando en el servidor... El modelo se está procesando en la nube.
          </p>
        </div>
      )}
    </motion.div>
  );
}
