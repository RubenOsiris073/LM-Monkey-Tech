import fs from 'fs';
import path from 'path';

export class FileWriterService {
  
  /**
   * Saves an individual file with appropriate handling for different content types
   */
  static async saveFile(
    filePath: string, 
    content: string | Buffer | number[]
  ): Promise<void> {
    try {
      if (Buffer.isBuffer(content)) {
        fs.writeFileSync(filePath, content);
      } else if (Array.isArray(content)) {
        // Convert number array to Buffer for binary files
        fs.writeFileSync(filePath, Buffer.from(content));
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    } catch (error) {
      console.error(`Error saving file ${filePath}:`, error);
      throw new Error(`Failed to save file: ${path.basename(filePath)}`);
    }
  }

  /**
   * Saves multiple files in parallel
   */
  static async saveFiles(files: Array<{
    path: string;
    content: string | Buffer | number[];
  }>): Promise<void> {
    try {
      await Promise.all(
        files.map(file => this.saveFile(file.path, file.content))
      );
    } catch (error) {
      console.error('Error saving multiple files:', error);
      throw error;
    }
  }

  /**
   * Saves a JSON object to a file
   */
  static async saveJsonFile(filePath: string, data: any): Promise<void> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonContent, 'utf8');
    } catch (error) {
      console.error(`Error saving JSON file ${filePath}:`, error);
      throw new Error(`Failed to save JSON file: ${path.basename(filePath)}`);
    }
  }

  /**
   * Reads a JSON file and parses it
   */
  static readJsonFile<T = any>(filePath: string): T {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content) as T;
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error);
      throw new Error(`Failed to read JSON file: ${path.basename(filePath)}`);
    }
  }

  /**
   * Checks if a file exists
   */
  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Gets file size in bytes
   */
  static getFileSize(filePath: string): number {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      console.error(`Error getting file size for ${filePath}:`, error);
      return 0;
    }
  }
}
