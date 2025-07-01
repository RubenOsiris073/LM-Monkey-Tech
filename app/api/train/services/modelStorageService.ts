import fs from 'fs';
import path from 'path';
import { CompleteModel } from '../types';

export class ModelStorageService {
  private static readonly MODELS_DIR = path.join(process.cwd(), 'stored-models');

  /**
   * Ensures the models directory exists
   */
  static ensureModelsDirectory(): void {
    if (!fs.existsSync(this.MODELS_DIR)) {
      fs.mkdirSync(this.MODELS_DIR, { recursive: true });
    }
  }

  /**
   * Gets the path to a model directory
   */
  static getModelPath(modelId: string): string {
    return path.join(this.MODELS_DIR, modelId);
  }

  /**
   * Checks if a model directory exists
   */
  static modelExists(modelId: string): boolean {
    const modelDir = this.getModelPath(modelId);
    return fs.existsSync(modelDir);
  }

  /**
   * Creates a new model directory
   */
  static createModelDirectory(modelId: string): string {
    this.ensureModelsDirectory();
    const modelDir = this.getModelPath(modelId);
    
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }
    
    return modelDir;
  }

  /**
   * Lists all available models
   */
  static listModels(): string[] {
    this.ensureModelsDirectory();
    
    try {
      return fs.readdirSync(this.MODELS_DIR)
        .filter(item => {
          const itemPath = path.join(this.MODELS_DIR, item);
          return fs.statSync(itemPath).isDirectory();
        });
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  /**
   * Deletes a model directory and all its contents
   */
  static deleteModel(modelId: string): boolean {
    try {
      const modelDir = this.getModelPath(modelId);
      if (fs.existsSync(modelDir)) {
        fs.rmSync(modelDir, { recursive: true, force: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting model ${modelId}:`, error);
      return false;
    }
  }
}
