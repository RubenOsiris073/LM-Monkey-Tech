'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StatusHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <Link 
          href="/"
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al inicio</span>
        </Link>
        <div className="w-px h-6 bg-gray-300" />
        <h1 className="text-3xl font-bold text-gray-800">Estado del Proyecto</h1>
      </div>
    </div>
  );
}
