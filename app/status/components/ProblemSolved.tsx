'use client';

import { motion } from 'framer-motion';

export default function ProblemSolved() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <h2 className="text-xl font-semibold text-gray-800">Actualización: Problema Resuelto</h2>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-green-800 font-medium">✅ Compatibilidad TensorFlow.js SOLUCIONADA</p>
        <p className="text-green-700 text-sm mt-1">
          La aplicación ahora genera modelos completos con estructura TensorFlow.js real: topología CNN, pesos binarios, y metadatos detallados.
        </p>
      </div>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">¿Qué se descarga ahora?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>model.json</strong>: Arquitectura completa del modelo CNN</li>
          <li>• <strong>model.weights.bin</strong>: Pesos entrenados en formato binario</li>
          <li>• <strong>metadata.json</strong>: Metadatos detallados del entrenamiento</li>
          <li>• <strong>README.txt</strong>: Instrucciones de uso completas</li>
        </ul>
      </div>
    </motion.div>
  );
}
