'use client';

import { motion } from 'framer-motion';

interface ContentTitleProps {
  modelCount: number;
}

export default function ContentTitle({ modelCount }: ContentTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Gestión de Modelos</h1>
      <p className="text-gray-600">
        Administra tus modelos entrenados • {modelCount} modelo{modelCount !== 1 ? 's' : ''} guardado{modelCount !== 1 ? 's' : ''}
      </p>
    </motion.div>
  );
}
