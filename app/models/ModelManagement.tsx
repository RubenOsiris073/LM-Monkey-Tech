'use client';

import ModelHeader from './components/ModelHeader';
import ModelStats from './components/ModelStats';
import StorageInfo from './components/StorageInfo';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyModelState from './components/EmptyModelState';
import ModelGrid from './components/ModelGrid';
import { useModelManagement } from './hooks/useModelManagement';

export default function ModelManagementDashboardPage() {
  const {
    savedModels,
    isLoading,
    loadSavedModels,
    exportModel,
    deleteModel,
    copyModelName
  } = useModelManagement();

  return (
    <div className="min-h-screen bg-models">
      <div className="container mx-auto px-4 py-8">
        <ModelHeader 
          modelCount={savedModels.length}
          onRefresh={loadSavedModels}
        />

        {!isLoading && <ModelStats models={savedModels} />}

        <StorageInfo />

        {isLoading ? (
          <LoadingSpinner />
        ) : savedModels.length === 0 ? (
          <EmptyModelState />
        ) : (
          <ModelGrid
            models={savedModels}
            onExportModel={exportModel}
            onDeleteModel={deleteModel}
            onCopyModelName={copyModelName}
          />
        )}
      </div>
    </div>
  );
}
