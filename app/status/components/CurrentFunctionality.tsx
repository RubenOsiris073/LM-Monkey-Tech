'use client';

import { motion } from 'framer-motion';
import { Brain, ImageIcon, Zap } from 'lucide-react';

export default function CurrentFunctionality() {
  const functionalityItems = [
    {
      icon: ImageIcon,
      title: 'Entrenamiento',
      description: 'Permite cargar imágenes por clase, simula el proceso de entrenamiento y genera métricas realistas de progreso.',
      color: 'green'
    },
    {
      icon: Zap,
      title: 'Clasificación',
      description: 'Procesa imágenes enviadas al servidor y devuelve predicciones simuladas con niveles de confianza realistas.',
      color: 'blue'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Brain className="w-6 h-6 text-purple-500 mr-2" />
        Funcionalidad Actual
      </h2>
      
      <div className="space-y-4">
        {functionalityItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <item.icon className={`w-5 h-5 text-${item.color}-600`} />
              <span className="font-medium text-gray-800">{item.title}</span>
            </div>
            <p className="text-sm text-gray-600">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
