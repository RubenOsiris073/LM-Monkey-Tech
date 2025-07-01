'use client';

import { Brain } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EmptyModelState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-primary text-center"
    >
      <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay modelos guardados</h3>
      <p className="text-gray-600 mb-6">
        Entrena tu primer modelo para verlo aquí
      </p>
      <Link
        href="/train"
        className="btn-primary inline-flex items-center space-x-2"
      >
        <Brain className="w-4 h-4" />
        <span>Entrenar Modelo</span>
      </Link>
    </motion.div>
  );
}
