import { TrainingData } from '../types';
import { ML_CONFIG } from '@/src/config/ml-config';

export class TrainingValidationService {
  
  /**
   * Validates training data to ensure it meets minimum requirements
   */
  static validateTrainingData(data: TrainingData): { isValid: boolean; error?: string } {
    if (!data.classes || data.classes.length < 2) {
      return {
        isValid: false,
        error: 'Se necesitan al menos 2 clases para entrenar'
      };
    }

    // Validate each class
    for (const classData of data.classes) {
      const classValidation = this.validateClass(classData);
      if (!classValidation.isValid) {
        return classValidation;
      }
    }

    // Validate overall data quality
    const qualityValidation = this.validateDataQuality(data);
    if (!qualityValidation.isValid) {
      return qualityValidation;
    }

    return { isValid: true };
  }

  /**
   * Validates a single class data
   */
  private static validateClass(classData: any): { isValid: boolean; error?: string } {
    if (!classData.name || classData.name.trim() === '') {
      return {
        isValid: false,
        error: 'Todas las clases deben tener un nombre válido'
      };
    }
    
    if (!classData.images || classData.images.length === 0) {
      return {
        isValid: false,
        error: `La clase "${classData.name}" debe tener al menos una imagen`
      };
    }

    // Check for minimum images per class using shared configuration
    if (classData.images.length < ML_CONFIG.MODEL.MIN_IMAGES_PER_CLASS) {
      return {
        isValid: false,
        error: `La clase "${classData.name}" necesita al menos ${ML_CONFIG.MODEL.MIN_IMAGES_PER_CLASS} imágenes para un entrenamiento efectivo`
      };
    }

    // Validate image formats
    for (let i = 0; i < classData.images.length; i++) {
      const image = classData.images[i];
      if (!this.isValidBase64Image(image)) {
        return {
          isValid: false,
          error: `Imagen ${i + 1} en la clase "${classData.name}" no es válida`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validates overall data quality
   */
  private static validateDataQuality(data: TrainingData): { isValid: boolean; error?: string } {
    const totalImages = data.classes.reduce((total, c) => total + c.images.length, 0);
    
    if (totalImages < 10) {
      return {
        isValid: false,
        error: 'Se necesitan al menos 10 imágenes en total para entrenar un modelo'
      };
    }

    // Check for class balance
    const imageCounts = data.classes.map(c => c.images.length);
    const maxImages = Math.max(...imageCounts);
    const minImages = Math.min(...imageCounts);
    
    if (maxImages / minImages > 5) {
      return {
        isValid: false,
        error: 'Las clases están muy desbalanceadas. La diferencia entre clases no debe ser mayor a 5:1'
      };
    }

    // Check for duplicate class names
    const classNames = data.classes.map(c => c.name.toLowerCase());
    const uniqueNames = new Set(classNames);
    if (classNames.length !== uniqueNames.size) {
      return {
        isValid: false,
        error: 'No puede haber nombres de clases duplicados'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates if a string is a valid base64 image
   */
  private static isValidBase64Image(base64String: string): boolean {
    if (!base64String || typeof base64String !== 'string') {
      return false;
    }

    // Check if it's a proper data URL
    const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    if (!dataUrlPattern.test(base64String)) {
      return false;
    }

    // Extract base64 part
    const base64Data = base64String.split(',')[1];
    if (!base64Data) {
      return false;
    }

    // Validate base64 format
    try {
      return btoa(atob(base64Data)) === base64Data;
    } catch {
      return false;
    }
  }

  /**
   * Gets training data statistics
   */
  static getTrainingStats(data: TrainingData): {
    totalClasses: number;
    totalImages: number;
    averageImagesPerClass: number;
    minImages: number;
    maxImages: number;
    classDistribution: Array<{ className: string; imageCount: number }>;
  } {
    const classDistribution = data.classes.map(c => ({
      className: c.name,
      imageCount: c.images.length
    }));

    const imageCounts = data.classes.map(c => c.images.length);
    const totalImages = imageCounts.reduce((sum, count) => sum + count, 0);

    return {
      totalClasses: data.classes.length,
      totalImages,
      averageImagesPerClass: Math.round(totalImages / data.classes.length),
      minImages: Math.min(...imageCounts),
      maxImages: Math.max(...imageCounts),
      classDistribution
    };
  }
}
