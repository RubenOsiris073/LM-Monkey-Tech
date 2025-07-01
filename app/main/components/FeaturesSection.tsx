'use client';

import { motion } from 'framer-motion';
import { Upload, Brain, BarChart3, Download } from 'lucide-react';

export default function FeaturesSection() {
  const groceryMLFeatures = [
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

  return (
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
          {groceryMLFeatures.map((feature, index) => (
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
  );
}
