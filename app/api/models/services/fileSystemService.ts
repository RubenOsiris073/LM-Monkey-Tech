import { promises as fs } from 'fs';
import path from 'path';
import { StoredModel, ModelInfo } from '../types';

// Directorio para almacenar modelos
const MODELS_DIR = path.join(process.cwd(), 'stored-models');

export class FileSystemService {
  // Asegurar que el directorio existe
  static async ensureModelsDir(): Promise<void> {
    try {
      await fs.access(MODELS_DIR);
    } catch {
      await fs.mkdir(MODELS_DIR, { recursive: true });
    }
  }

  // Guardar modelo en el sistema de archivos
  static async saveModel(model: StoredModel): Promise<void> {
    await this.ensureModelsDir();
    
    const modelDir = path.join(MODELS_DIR, model.id);
    await fs.mkdir(modelDir, { recursive: true });
    
    // Guardar archivos del modelo
    await fs.writeFile(path.join(modelDir, 'model.json'), model.files['model.json']);
    await fs.writeFile(path.join(modelDir, 'model.weights.bin'), model.files['model.weights.bin']);
    await fs.writeFile(path.join(modelDir, 'metadata.json'), model.files['metadata.json']);
    await fs.writeFile(path.join(modelDir, 'README.txt'), model.files['README.txt']);
    
    // Guardar información del modelo
    await fs.writeFile(
      path.join(modelDir, 'model-info.json'), 
      JSON.stringify(model.metadata, null, 2)
    );
  }

  // Cargar modelo del sistema de archivos
  static async loadModel(modelId: string): Promise<StoredModel | null> {
    try {
      await this.ensureModelsDir();
      const modelDir = path.join(MODELS_DIR, modelId);
      
      // Verificar que existe
      await fs.access(modelDir);
      
      // Cargar archivos
      const modelJson = await fs.readFile(path.join(modelDir, 'model.json'), 'utf-8');
      const weightsBuffer = await fs.readFile(path.join(modelDir, 'model.weights.bin'));
      const metadataJson = await fs.readFile(path.join(modelDir, 'metadata.json'), 'utf-8');
      const readmeText = await fs.readFile(path.join(modelDir, 'README.txt'), 'utf-8');
      const modelInfo = await fs.readFile(path.join(modelDir, 'model-info.json'), 'utf-8');
      
      return {
        id: modelId,
        metadata: JSON.parse(modelInfo),
        files: {
          'model.json': modelJson,
          'model.weights.bin': weightsBuffer,
          'metadata.json': metadataJson,
          'README.txt': readmeText
        }
      };
    } catch {
      return null;
    }
  }

  // Listar todos los modelos
  static async listModels(): Promise<ModelInfo[]> {
    try {
      await this.ensureModelsDir();
      const modelDirs = await fs.readdir(MODELS_DIR);
      const models: ModelInfo[] = [];
      
      for (const dir of modelDirs) {
        try {
          const modelInfoPath = path.join(MODELS_DIR, dir, 'model-info.json');
          const modelInfo = JSON.parse(await fs.readFile(modelInfoPath, 'utf-8'));
          
          models.push({
            id: dir,
            name: modelInfo.name || modelInfo.modelName || dir,
            classes: modelInfo.classes || modelInfo.labels || [],
            accuracy: modelInfo.finalMetrics?.accuracy || 0,
            createdAt: modelInfo.createdAt || new Date().toISOString(),
            modelSize: modelInfo.modelSize || 0,
            trainedImages: modelInfo.trainedImages || 0
          });
        } catch (error) {
          console.error(`Error loading model ${dir}:`, error);
        }
      }
      
      return models.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  }

  // Eliminar modelo del sistema de archivos
  static async deleteModel(modelId: string): Promise<boolean> {
    try {
      const modelDir = path.join(MODELS_DIR, modelId);
      await fs.rm(modelDir, { recursive: true, force: true });
      return true;
    } catch {
      return false;
    }
  }
}
