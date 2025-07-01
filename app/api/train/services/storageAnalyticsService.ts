import fs from 'fs';
import path from 'path';
import { ModelStorageService } from './modelStorageService';

export class StorageAnalyticsService {
  
  /**
   * Gets storage information for all models
   */
  static getStorageInfo(): {
    totalModels: number;
    totalSize: number;
    availableSpace: number;
  } {
    const models = ModelStorageService.listModels();
    let totalSize = 0;

    models.forEach(modelId => {
      const modelPath = ModelStorageService.getModelPath(modelId);
      try {
        const stats = fs.statSync(modelPath);
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(modelPath);
        }
      } catch (error) {
        console.error(`Error getting size for model ${modelId}:`, error);
      }
    });

    return {
      totalModels: models.length,
      totalSize,
      availableSpace: this.getAvailableDiskSpace()
    };
  }

  /**
   * Gets the size of a directory recursively
   */
  static getDirectorySize(dirPath: string): number {
    let totalSize = 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      });
    } catch (error) {
      console.error(`Error calculating directory size for ${dirPath}:`, error);
    }
    
    return totalSize;
  }

  /**
   * Gets available disk space (simplified implementation)
   */
  static getAvailableDiskSpace(): number {
    try {
      // This is a simplified calculation - in production you'd use statvfs or similar
      return 1024 * 1024 * 1024 * 10; // Return 10GB as available space
    } catch (error) {
      console.error('Error getting disk space:', error);
      return 0;
    }
  }

  /**
   * Gets detailed information about a specific model
   */
  static getModelInfo(modelId: string): {
    exists: boolean;
    size: number;
    fileCount: number;
    files: string[];
  } {
    const modelPath = ModelStorageService.getModelPath(modelId);
    
    if (!fs.existsSync(modelPath)) {
      return {
        exists: false,
        size: 0,
        fileCount: 0,
        files: []
      };
    }

    try {
      const files = fs.readdirSync(modelPath);
      const size = this.getDirectorySize(modelPath);
      
      return {
        exists: true,
        size,
        fileCount: files.length,
        files
      };
    } catch (error) {
      console.error(`Error getting model info for ${modelId}:`, error);
      return {
        exists: false,
        size: 0,
        fileCount: 0,
        files: []
      };
    }
  }

  /**
   * Gets storage usage summary
   */
  static getStorageSummary(): {
    totalModels: number;
    totalSizeGB: number;
    availableSpaceGB: number;
    averageModelSizeMB: number;
  } {
    const info = this.getStorageInfo();
    
    return {
      totalModels: info.totalModels,
      totalSizeGB: Number((info.totalSize / (1024 * 1024 * 1024)).toFixed(2)),
      availableSpaceGB: Number((info.availableSpace / (1024 * 1024 * 1024)).toFixed(2)),
      averageModelSizeMB: info.totalModels > 0 
        ? Number(((info.totalSize / info.totalModels) / (1024 * 1024)).toFixed(2))
        : 0
    };
  }
}
