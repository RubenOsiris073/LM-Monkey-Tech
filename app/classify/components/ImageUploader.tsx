'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Target } from 'lucide-react';
import { ML_CONFIG } from '@/src/config/ml-config';

interface ImageUploaderProps {
  selectedImage: string | null;
  isClassifying: boolean;
  modelLoaded: boolean;
  onImageSelect: (file: File) => void;
  onClassifyImage: () => void;
}

export default function ImageUploader({
  selectedImage,
  isClassifying,
  modelLoaded,
  onImageSelect,
  onClassifyImage
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-primary"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Seleccionar Imagen</h2>
      
      {!selectedImage ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept={ML_CONFIG.UI.ACCEPTED_FORMATS.join(',')}
            onChange={(e) => e.target.files?.[0] && onImageSelect(e.target.files[0])}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 p-8 rounded-lg transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <span className="text-lg text-gray-600 mb-2">
              Sube una imagen de producto
            </span>
            <span className="text-sm text-gray-400">
              PNG, JPG, WEBP hasta 10MB
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              ref={imageRef}
              src={selectedImage}
              alt="Imagen a clasificar"
              className="w-full h-64 object-cover rounded-lg"
              crossOrigin="anonymous"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Cambiar imagen</span>
            </button>
            
            <button
              onClick={onClassifyImage}
              disabled={!selectedImage || isClassifying || !modelLoaded}
              className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Target className="w-4 h-4" />
              <span>
                {isClassifying ? 'Clasificando...' : !modelLoaded ? 'Carga un modelo primero' : 'Clasificar'}
              </span>
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={ML_CONFIG.UI.ACCEPTED_FORMATS.join(',')}
            onChange={(e) => e.target.files?.[0] && onImageSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}
    </motion.div>
  );
}
