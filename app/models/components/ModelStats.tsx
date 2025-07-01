'use client';

import { motion } from 'framer-motion';
import { Brain, Calendar, HardDrive } from 'lucide-react';
import { SavedModel } from '../types';

interface ModelStatsProps {
  models: SavedModel[];
}

export default function ModelStats({ models }: ModelStatsProps) {
  const totalModels = models.length;
  const averageAccuracy = models.length > 0 
    ? (models.filter(m => m.accuracy).reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.filter(m => m.accuracy).length * 100).toFixed(1)
    : 0;
  
  const totalSize = models.reduce((sum, model) => {
    const sizeInMB = parseFloat(model.size.replace(' MB', ''));
    return sum + sizeInMB;
  }, 0).toFixed(1);

  const stats = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Modelos Guardados",
      value: totalModels.toString(),
      color: "bg-blue-500"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Precisión Promedio",
      value: `${averageAccuracy}%`,
      color: "bg-green-500"
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      title: "Espacio Usado",
      value: `${totalSize} MB`,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card-primary"
        >
          <div className="flex items-center space-x-4">
            <div className={`${stat.color} p-3 rounded-lg text-white`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
