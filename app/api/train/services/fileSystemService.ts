import { CompleteModel, ModelMetadata } from '../types';
import { ModelStorageService } from './modelStorageService';
import { ModelSaveService } from './modelSaveService';
import { StorageAnalyticsService } from './storageAnalyticsService';

/**
 * Main file system service that orchestrates other specialized services
 * This is the main interface for file system operations
 */
export class TrainingFileService {
  
  /**
   * Saves a complete model to the file system
   */
  static async saveModel(modelId: string, model: CompleteModel): Promise<void> {
    return ModelSaveService.saveModel(modelId, model);
  }

  /**
   * Creates model info file with training metadata
   */
  static async createModelInfoFile(modelId: string, metadata: ModelMetadata): Promise<void> {
    return ModelSaveService.createModelInfoFile(modelId, metadata);
  }

  /**
   * Checks if a model directory exists
   */
  static modelExists(modelId: string): boolean {
    return ModelStorageService.modelExists(modelId);
  }

  /**
   * Gets the path to a model directory
   */
  static getModelPath(modelId: string): string {
    return ModelStorageService.getModelPath(modelId);
  }

  /**
   * Lists all available models
   */
  static listModels(): string[] {
    return ModelStorageService.listModels();
  }

  /**
   * Gets storage information
   */
  static getStorageInfo(): {
    totalModels: number;
    totalSize: number;
    availableSpace: number;
  } {
    return StorageAnalyticsService.getStorageInfo();
  }

  /**
   * Deletes a model
   */
  static deleteModel(modelId: string): boolean {
    return ModelStorageService.deleteModel(modelId);
  }

  /**
   * Gets detailed model information
   */
  static getModelInfo(modelId: string) {
    return StorageAnalyticsService.getModelInfo(modelId);
  }

  /**
   * Gets storage summary with human-readable sizes
   */
  static getStorageSummary() {
    return StorageAnalyticsService.getStorageSummary();
  }
}
