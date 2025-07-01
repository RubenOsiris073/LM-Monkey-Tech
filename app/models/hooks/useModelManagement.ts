'use client';

import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { SavedModel } from '../types';

export function useModelManagement() {
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedModels();
  }, []);

  // Cargar modelos guardados desde el servidor
  const loadSavedModels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const models: SavedModel[] = data.models.map((model: any) => ({
            name: model.name,
            createdAt: model.createdAt,
            size: `${(model.modelSize / 1024 / 1024).toFixed(1)} MB`,
            accuracy: model.accuracy,
            classes: model.classes,
            id: model.id
          }));
          setSavedModels(models);
        }
      } else {
        console.error('Error cargando modelos');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar modelo (descargar archivos)
  const exportModel = async (model: SavedModel) => {
    try {
      const response = await fetch(`/api/models?download=true&modelId=${model.id}`);
      
      if (response.ok) {
        // Check if the response is a ZIP file (binary)
        const contentType = response.headers.get('content-type');
        if (contentType === 'application/zip') {
          // Handle direct ZIP download from server
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${model.name.replace(/\s+/g, '-')}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          alert('Modelo descargado exitosamente');
        } else {
          // Handle JSON response with model data
          const data = await response.json();
          
          if (data.success && data.model) {
            // Crear ZIP con los archivos del modelo
            const zip = new JSZip();
            
            // Agregar archivos al ZIP
            zip.file('model.json', data.model.files['model.json']);
            zip.file('model.weights.bin', new Uint8Array(data.model.files['model.weights.bin']));
            zip.file('metadata.json', data.model.files['metadata.json']);
            zip.file('README.txt', data.model.files['README.txt']);
            
            // Generar y descargar ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${model.name.replace(/\s+/g, '-')}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Modelo descargado exitosamente');
          } else {
            throw new Error('No se pudieron obtener los datos del modelo');
          }
        }
      } else {
        throw new Error('Error al descargar el modelo');
      }
    } catch (error) {
      console.error('Error exportando modelo:', error);
      alert('Error al exportar el modelo: ' + (error as Error).message);
    }
  };

  // Eliminar modelo
  const deleteModel = async (model: SavedModel) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el modelo "${model.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/models?modelId=${model.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recargar la lista de modelos
        await loadSavedModels();
        alert('Modelo eliminado exitosamente');
      } else {
        throw new Error('Error al eliminar el modelo');
      }
    } catch (error) {
      console.error('Error eliminando modelo:', error);
      alert('Error al eliminar el modelo: ' + (error as Error).message);
    }
  };

  // Copiar nombre del modelo
  const copyModelName = (modelName: string) => {
    navigator.clipboard.writeText(modelName);
    alert('Nombre del modelo copiado al portapapeles');
  };

  return {
    savedModels,
    isLoading,
    loadSavedModels,
    exportModel,
    deleteModel,
    copyModelName
  };
}
