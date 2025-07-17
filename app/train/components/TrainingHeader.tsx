'use client';

import { ArrowLeft, User, Download, Zap } from 'lucide-react';
import Link from 'next/link';

interface TrainingHeaderProps {
  classes: any[];
  totalImages: number;
  trainedModel: any;
  onDownloadModel: () => void;
  isTraining: boolean;
}

export default function TrainingHeader({ 
  classes, 
  totalImages, 
  trainedModel, 
  onDownloadModel, 
  isTraining 
}: TrainingHeaderProps) {
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
        <Link
          href="/classify"
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <Zap className="w-5 h-5" />
          <span>Clasificar</span>
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
      
      <div className="flex items-center space-x-4">
        <div className="badge-primary">
          {classes.length} clases • {totalImages} imágenes
        </div>
        {!isTraining && trainedModel && (
          <button
            onClick={onDownloadModel}
            className="btn-success"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Modelo</span>
          </button>
        )}
      </div>
    </div>
  );
}
