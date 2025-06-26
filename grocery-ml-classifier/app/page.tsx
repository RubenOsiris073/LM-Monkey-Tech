'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Brain, 
  Upload, 
  Download, 
  BarChart3, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Carga Inteligente",
      description: "Arrastra y suelta imágenes de productos para entrenamiento automático"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "IA Avanzada",
      description: "Modelos de deep learning optimizados para productos de abarrotes"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Métricas en Tiempo Real",
      description: "Visualiza el progreso de entrenamiento con gráficos interactivos"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Exportación Fácil",
      description: "Descarga tus modelos entrenados en formato TensorFlow.js"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Define Categorías",
      description: "Crea las clases de productos que quieres clasificar"
    },
    {
      number: "02", 
      title: "Carga Imágenes",
      description: "Sube fotos de tus productos organizadas por categoría"
    },
    {
      number: "03",
      title: "Entrena el Modelo",
      description: "La IA aprende automáticamente de tus datos"
    },
    {
      number: "04",
      title: "Prueba y Descarga",
      description: "Evalúa el rendimiento y exporta tu modelo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Grocery ML</h1>
                <p className="text-sm text-gray-600">Clasificador Inteligente</p>
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

      {/* Hero Section */}
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
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Potencia tu Negocio con IA
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas profesionales para crear clasificadores de productos 
              sin conocimientos técnicos previos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gray-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para Revolucionar tu Inventario?
            </h2>
            
            <p className="text-xl text-blue-100 mb-8">
              Únete a cientos de empresas que ya están usando IA para 
              optimizar su gestión de productos.
            </p>
            
            <div className="flex justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/train"
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Empezar Gratis Ahora
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
