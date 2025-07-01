'use client';

import { HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StorageInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-info mb-8"
    >
      <div className="flex items-start space-x-3">
        <HardDrive className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Almacenamiento en Servidor</h3>
          <p className="text-sm text-blue-700 mb-3">
            Los modelos se guardan automáticamente en el servidor después del entrenamiento. 
            Están disponibles desde cualquier dispositivo y navegador.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
              ✓ Acceso desde cualquier dispositivo
            </span>
            <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
              ✓ Almacenamiento persistente
            </span>
            <span className="px-2 py-1 bg-green-200 text-green-800 rounded">
              ✓ Guardado automático
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
