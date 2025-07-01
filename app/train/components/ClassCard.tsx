'use client';

import { motion } from 'framer-motion';
import { Upload, X, Trash2, AlertCircle } from 'lucide-react';
import { ML_CONFIG } from '@/src/config/ml-config';

interface ImageData {
  file: File;
  url: string;
  id: string;
  data: string;
}

interface ClassData {
  name: string;
  images: ImageData[];
  id: string;
}

interface ClassCardProps {
  classData: ClassData;
  index: number;
  onRemoveClass: (classId: string) => void;
  onImageUpload: (classId: string, files: FileList) => void;
  onRemoveImage: (classId: string, imageId: string) => void;
}

export default function ClassCard({ 
  classData, 
  index, 
  onRemoveClass, 
  onImageUpload, 
  onRemoveImage 
}: ClassCardProps) {
  return (
    <motion.div
      key={classData.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <h3 className="text-lg font-medium text-gray-800">{classData.name}</h3>
          <span className="text-sm text-gray-500">
            {classData.images.length} imagen{classData.images.length !== 1 ? 'es' : ''}
          </span>
          {classData.images.length < ML_CONFIG.MODEL.MIN_IMAGES_PER_CLASS && (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
        </div>
        <button
          onClick={() => onRemoveClass(classData.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Zona de subida */}
      <div className="upload-zone mb-4">
        <input
          type="file"
          multiple
          accept={ML_CONFIG.UI.ACCEPTED_FORMATS.join(',')}
          onChange={(e) => e.target.files && onImageUpload(classData.id, e.target.files)}
          className="hidden"
          id={`upload-${classData.id}`}
        />
        <label
          htmlFor={`upload-${classData.id}`}
          className="flex flex-col items-center justify-center cursor-pointer p-6 rounded-3xl transition-colors"
        >
          <div className="icon-gradient mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-700 mb-2">
            Arrastra imágenes aquí o haz clic para seleccionar
          </span>
          <span className="text-sm text-gray-500">
            PNG, JPG, WEBP hasta 10MB
          </span>
        </label>
      </div>

      {/* Grid de imágenes */}
      {classData.images.length > 0 && (
        <div className="grid grid-cols-6 gap-3">
          {classData.images.map((img) => (
            <div
              key={img.id}
              className="relative group aspect-square"
            >
              <img
                src={img.url}
                alt={`${classData.name} - ${img.id}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => onRemoveImage(classData.id, img.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
