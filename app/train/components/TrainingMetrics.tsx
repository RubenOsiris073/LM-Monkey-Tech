'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { ML_CONFIG } from '@/src/config/ml-config';

interface TrainingMetricsProps {
  trainingMetrics: any;
}

export default function TrainingMetrics({ trainingMetrics }: TrainingMetricsProps) {
  if (!trainingMetrics) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Métricas</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700">Época:</span>
          <span className="font-semibold text-gray-900">{trainingMetrics.epoch}/{ML_CONFIG.TRAINING.DEFAULT_EPOCHS}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700">Pérdida:</span>
          <span className="font-semibold text-gray-900">{trainingMetrics.loss.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700">Precisión:</span>
          <span className="font-semibold text-green-600">{(trainingMetrics.accuracy * 100).toFixed(1)}%</span>
        </div>
        {trainingMetrics.valAccuracy && (
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Precisión Val:</span>
            <span className="font-semibold text-blue-600">{(trainingMetrics.valAccuracy * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
