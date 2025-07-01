'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, CheckCircle } from 'lucide-react';

interface ModelFiles {
  modelJson: File | null;
  weightsFile: File | null;
  metadataJson: File | null;
}

interface ModelMetadata {
  modelName?: string;
  name?: string;
  labels: string[];
  classes?: string[];
  classLabels?: { id: number; name: string }[];
  numClasses?: number;
  inputShape?: number[];
  outputShape?: number[];
  architecture?: string;
  framework?: string;
  version?: string;
  createdAt?: string;
  finalMetrics?: {
    accuracy?: number;
    loss?: number;
  };
}

interface ModelLoaderProps {
  modelFiles: ModelFiles;
  modelMetadata: ModelMetadata | null;
  modelLoaded: boolean;
  isLoadingModel: boolean;
  onModelFileSelect: (type: keyof ModelFiles, file: File) => void;
  onLoadModel: () => void;
  onResetModel: () => void;
}

export default function ModelLoader({
  modelFiles,
  modelMetadata,
  modelLoaded,
  isLoadingModel,
  onModelFileSelect,
  onLoadModel,
  onResetModel
}: ModelLoaderProps) {
  const modelJsonRef = useRef<HTMLInputElement>(null);
  const weightsRef = useRef<HTMLInputElement>(null);
  const metadataRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-primary"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
        <Settings className="w-5 h-5" />
        <span>Cargar Modelo</span>
      </h2>
      
      {!modelLoaded ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Carga los 3 archivos esenciales de tu modelo entrenado:
          </p>
          
          {/* model.json */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. model.json
            </label>
            <input
              ref={modelJsonRef}
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && onModelFileSelect('modelJson', e.target.files[0])}
              className="input-primary"
            />
            {modelFiles.modelJson && (
              <p className="text-xs text-green-600 mt-1">✓ {modelFiles.modelJson.name}</p>
            )}
          </div>

          {/* model.weights.bin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. model.weights.bin
            </label>
            <input
              ref={weightsRef}
              type="file"
              accept=".bin"
              onChange={(e) => e.target.files?.[0] && onModelFileSelect('weightsFile', e.target.files[0])}
              className="input-primary"
            />
            {modelFiles.weightsFile && (
              <p className="text-xs text-green-600 mt-1">✓ {modelFiles.weightsFile.name}</p>
            )}
          </div>

          {/* metadata.json */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. metadata.json
            </label>
            <input
              ref={metadataRef}
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && onModelFileSelect('metadataJson', e.target.files[0])}
              className="input-primary"
            />
            {modelFiles.metadataJson && (
              <p className="text-xs text-green-600 mt-1">✓ {modelFiles.metadataJson.name}</p>
            )}
          </div>

          <button
            onClick={onLoadModel}
            disabled={!modelFiles.modelJson || !modelFiles.weightsFile || !modelFiles.metadataJson || isLoadingModel}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingModel ? 'Cargando modelo...' : 'Cargar Modelo'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Modelo cargado</span>
          </div>
          
          {modelMetadata && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Nombre:</strong> {modelMetadata.modelName || 'Modelo personalizado'}
              </p>
              <p className="text-sm text-green-800">
                <strong>Clases:</strong> {modelMetadata.labels.length}
              </p>
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {modelMetadata.labels.slice(0, 3).map((label, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                      {label}
                    </span>
                  ))}
                  {modelMetadata.labels.length > 3 && (
                    <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                      +{modelMetadata.labels.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={onResetModel}
            className="btn-secondary w-full"
          >
            Cargar otro modelo
          </button>
        </div>
      )}
    </motion.div>
  );
}
