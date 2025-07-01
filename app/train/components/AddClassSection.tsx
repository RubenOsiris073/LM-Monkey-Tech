'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ML_CONFIG } from '@/src/config/ml-config';

interface AddClassSectionProps {
  newClassName: string;
  setNewClassName: (name: string) => void;
  addClass: () => void;
  classCount: number;
}

export default function AddClassSection({ 
  newClassName, 
  setNewClassName, 
  addClass, 
  classCount 
}: AddClassSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-primary"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Agregar Nueva Clase</h2>
      <div className="flex space-x-4">
        <input
          type="text"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          placeholder="Nombre de la clase (ej: Manzanas)"
          className="input-primary flex-1"
          onKeyPress={(e) => e.key === 'Enter' && addClass()}
        />
        <button
          onClick={addClass}
          disabled={!newClassName.trim() || classCount >= ML_CONFIG.MODEL.MAX_CLASSES}
          className="btn-info"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar</span>
        </button>
      </div>
      {classCount >= ML_CONFIG.MODEL.MAX_CLASSES && (
        <p className="text-sm text-amber-600 mt-2">
          Máximo {ML_CONFIG.MODEL.MAX_CLASSES} clases permitidas
        </p>
      )}
    </motion.div>
  );
}
