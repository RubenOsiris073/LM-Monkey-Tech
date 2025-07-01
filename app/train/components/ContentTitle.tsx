'use client';

import { motion } from 'framer-motion';

export default function ContentTitle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Entrenar Modelo</h1>
      <p className="text-gray-600">Crea y entrena tu modelo de clasificación de imágenes</p>
    </motion.div>
  );
}
