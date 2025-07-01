'use client';

import ModelCard from './ModelCard';
import { SavedModel } from '../types';

interface ModelGridProps {
  models: SavedModel[];
  onExportModel: (model: SavedModel) => void;
  onDeleteModel: (model: SavedModel) => void;
  onCopyModelName: (modelName: string) => void;
}

export default function ModelGrid({ models, onExportModel, onDeleteModel, onCopyModelName }: ModelGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map((model, index) => (
        <ModelCard
          key={model.id || index}
          model={model}
          index={index}
          onExport={onExportModel}
          onDelete={onDeleteModel}
          onCopyName={onCopyModelName}
        />
      ))}
    </div>
  );
}
