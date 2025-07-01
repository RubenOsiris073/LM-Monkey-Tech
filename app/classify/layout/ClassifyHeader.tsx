'use client';

import { ArrowLeft, Zap, User } from 'lucide-react';
import Link from 'next/link';

export default function ClassifyHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <Link 
          href="/"
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al inicio</span>
        </Link>
        <div className="w-px h-6 bg-gray-300" />
        <Link 
          href="/train"
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Zap className="w-5 h-5" />
          <span>Entrenar Modelo</span>
        </Link>
        <div className="w-px h-6 bg-gray-300" />
        <Link 
          href="/models"
          className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <User className="w-5 h-5" />
          <span>Mis Modelos</span>
        </Link>
        <div className="w-px h-6 bg-gray-300" />
      </div>
    </div>
  );
}
