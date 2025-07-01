'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Clasifica
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {" "}Productos
              </span>
              <br />
              con Inteligencia Artificial
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Crea modelos de machine learning personalizados para identificar y categorizar 
              productos de abarrotes con precisión profesional.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/train"
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <Zap className="w-5 h-5" />
                  Comenzar Entrenamiento
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/classify"
                  className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <Brain className="w-5 h-5" />
                  Probar Clasificador
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/status"
                  className="bg-purple-100 text-purple-700 px-6 py-4 rounded-2xl font-semibold text-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <CheckCircle className="w-5 h-5" />
                  Estado del Proyecto
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
