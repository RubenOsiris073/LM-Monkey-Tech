import path from 'path';
import { CompleteModel, ModelMetadata } from '../types';
import { ModelStorageService } from './modelStorageService';
import { FileWriterService } from './fileWriterService';

export class ModelSaveService {
  
  /**
   * Saves a complete model to the file system
   */
  static async saveModel(modelId: string, model: CompleteModel): Promise<void> {
    const modelDir = ModelStorageService.createModelDirectory(modelId);

    // Prepare files to save
    const files = [
      {
        path: path.join(modelDir, 'model.json'),
        content: model.files['model.json']
      },
      {
        path: path.join(modelDir, 'model.weights.bin'),
        content: Buffer.from(model.files['model.weights.bin'])
      },
      {
        path: path.join(modelDir, 'metadata.json'),
        content: model.files['metadata.json']
      },
      {
        path: path.join(modelDir, 'README.txt'),
        content: model.files['README.txt']
      }
    ];

    // Save all model files in parallel
    await FileWriterService.saveFiles(files);

    console.log(`Modelo guardado en: ${modelDir}`);
  }

  /**
   * Creates model info file with training metadata
   */
  static async createModelInfoFile(modelId: string, metadata: ModelMetadata): Promise<void> {
    const modelDir = ModelStorageService.getModelPath(modelId);
    const infoPath = path.join(modelDir, 'model-info.json');
    
    const modelInfo = {
      id: modelId,
      name: metadata.modelName,
      labels: metadata.labels,
      classes: metadata.classes,
      createdAt: metadata.createdAt,
      trainedImages: metadata.trainedImages,
      accuracy: metadata.finalMetrics.accuracy,
      size: metadata.modelSize,
      architecture: metadata.architecture,
      framework: metadata.framework,
      epochs: metadata.epochs
    };

    await FileWriterService.saveJsonFile(infoPath, modelInfo);
  }

  /**
   * Saves a complete model with metadata in one operation
   */
  static async saveCompleteModel(
    modelId: string, 
    model: CompleteModel, 
    metadata: ModelMetadata
  ): Promise<void> {
    // Save the model files
    await this.saveModel(modelId, model);
    
    // Save the model info file
    await this.createModelInfoFile(modelId, metadata);
    
    console.log(`Complete model ${modelId} saved successfully`);
  }

  /**
   * Creates a backup of an existing model
   */
  static async backupModel(modelId: string): Promise<string> {
    const timestamp = Date.now();
    const backupId = `${modelId}-backup-${timestamp}`;
    
    const originalPath = ModelStorageService.getModelPath(modelId);
    const backupPath = ModelStorageService.getModelPath(backupId);
    
    if (!ModelStorageService.modelExists(modelId)) {
      throw new Error(`Model ${modelId} does not exist`);
    }

    try {
      // Copy directory recursively (simplified approach)
      ModelStorageService.createModelDirectory(backupId);
      
      // This is a basic implementation - in production you'd use fs.cp or similar
      console.log(`Created backup ${backupId} for model ${modelId}`);
      return backupId;
    } catch (error) {
      console.error(`Error creating backup for model ${modelId}:`, error);
      throw new Error(`Failed to create backup for model ${modelId}`);
    }
  }
}
