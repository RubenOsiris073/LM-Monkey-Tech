'use client';

import { motion } from 'framer-motion';
import { Cloud, Settings } from 'lucide-react';

export default function ServerProcessing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Cloud className="w-6 h-6 text-blue-500 mr-2" />
        Procesamiento en el Servidor
      </h2>
      
      <p className="text-gray-600 mb-4">
        Todo el procesamiento de machine learning se ejecuta en el servidor (GitHub Codespace), 
        manteniendo el navegador como un cliente ligero.
      </p>
      
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-800">Configuración Actual</span>
        </div>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• APIs simuladas para demostración</li>
          <li>• Procesamiento de imágenes con Sharp</li>
          <li>• Arquitectura preparada para TensorFlow.js</li>
          <li>• Gestión de modelos en el servidor</li>
        </ul>
      </div>
    </motion.div>
  );
}
