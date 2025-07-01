'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function ImplementedFeatures() {
  const features = [
    'Interfaz moderna con Next.js 14 + Tailwind CSS',
    'Arquitectura modular y escalable',
    'API routes para entrenamiento y clasificación',
    'Gestión de estado con React hooks',
    'Procesamiento de imágenes en el servidor',
    'Componentes reutilizables con TypeScript'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
        Características Implementadas
      </h2>
      
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
