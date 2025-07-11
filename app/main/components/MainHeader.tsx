'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function MainHeader() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LM</h1>
              <p className="text-sm text-gray-600">Por Monkey Technologies</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/train" className="text-gray-700 hover:text-blue-600 transition-colors">
              Entrenar
            </Link>
            <Link href="/classify" className="text-gray-700 hover:text-blue-600 transition-colors">
              Clasificar
            </Link>
            <Link href="/models" className="text-gray-700 hover:text-blue-600 transition-colors">
              Modelos
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
