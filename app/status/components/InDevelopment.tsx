'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Code } from 'lucide-react';

export default function InDevelopment() {
  const developmentFeatures = [
    'Integración completa de TensorFlow.js-node',
    'Entrenamiento real de modelos CNN',
    'Persistencia de modelos entrenados',
    'Métricas de entrenamiento en tiempo real',
    'Exportación/importación de modelos'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
        En Desarrollo
      </h2>
      
      <div className="space-y-3">
        {developmentFeatures.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-yellow-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Code className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Nota Técnica</span>
        </div>
        <p className="text-sm text-yellow-700">
          La implementación completa de TensorFlow.js está disponible en 
          <code className="bg-yellow-100 px-1 rounded mx-1">src/lib/tensorflow-ml.ts</code> 
          y se activará una vez resueltos los problemas de compatibilidad con Next.js API routes.
        </p>
      </div>
    </motion.div>
  );
}
