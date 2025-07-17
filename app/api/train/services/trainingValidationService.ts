import { TrainingData } from '../types';
import { ML_CONFIG } from '@/src/config/ml-config';

export class TrainingValidationService {
  
  /**
   * Validates training data to ensure it meets minimum requirements
   */
  static validateTrainingData(data: TrainingData): { isValid: boolean; error?: string } {
    // Debug the incoming data
    this.debugImageData(data);

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

    // Check for minimum images per class (reducido para pruebas)
    if (classData.images.length < 1) {
      return {
        isValid: false,
        error: `La clase "${classData.name}" necesita al menos 1 imagen para entrenar`
      };
    }

    // Validate image formats (solo las primeras 3 para no ser muy estricto)
    const imagesToValidate = Math.min(3, classData.images.length);
    for (let i = 0; i < imagesToValidate; i++) {
      const image = classData.images[i];
      console.log(`🔍 Validando imagen ${i + 1} de la clase "${classData.name}"`);
      if (!this.isValidBase64Image(image)) {
        console.log(`❌ Imagen ${i + 1} de la clase "${classData.name}" falló la validación`);
        return {
          isValid: false,
          error: `Imagen ${i + 1} en la clase "${classData.name}" no es válida. Debe ser una imagen válida en formato base64. Formato recibido: ${typeof image}, primeros 50 caracteres: ${image?.substring(0, 50)}`
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
    
    if (totalImages < 2) {
      return {
        isValid: false,
        error: 'Se necesitan al menos 2 imágenes en total para entrenar un modelo'
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
    console.log(`🔍 Validando imagen (${typeof base64String}):`, base64String?.substring(0, 100));
    
    if (!base64String || typeof base64String !== 'string') {
      console.log('❌ Imagen no es string válido');
      return false;
    }

    // Check length first
    if (base64String.length < 50) {
      console.log('❌ String muy corto para ser imagen válida');
      return false;
    }

    // Check if it's a proper data URL
    const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp|bmp|tiff);base64,/i;
    const hasDataUrlPrefix = dataUrlPattern.test(base64String);
    
    console.log(`🔍 Tiene prefijo data URL: ${hasDataUrlPrefix}`);
    
    let base64Data: string;
    
    if (hasDataUrlPrefix) {
      // Extract base64 part from data URL
      base64Data = base64String.split(',')[1];
      console.log(`� Extraída parte base64: ${base64Data?.substring(0, 50)}...`);
    } else {
      // Maybe it's just base64 without data URL prefix
      console.log('🔄 No es data URL, intentando validar como base64 puro');
      base64Data = base64String;
    }

    if (!base64Data || base64Data.length === 0) {
      console.log('❌ No se pudo extraer parte base64');
      return false;
    }

    // Validate base64 format using regex (more compatible than btoa/atob)
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Pattern.test(base64Data)) {
      console.log('❌ Patrón base64 inválido');
      return false;
    }

    // Check if base64 length is valid (must be multiple of 4)
    if (base64Data.length % 4 !== 0) {
      console.log('❌ Longitud base64 inválida (no múltiplo de 4)');
      return false;
    }

    // Additional check: try to create a buffer (Node.js environment)
    try {
      if (typeof Buffer !== 'undefined') {
        const buffer = Buffer.from(base64Data, 'base64');
        // Check if it's a reasonable image size (at least 100 bytes)
        if (buffer.length < 100) {
          console.log('❌ Imagen muy pequeña (< 100 bytes)');
          return false;
        }
        console.log(`✅ Imagen válida (${buffer.length} bytes)`);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Buffer validation failed:', error);
    }

    // If we can't use Buffer, just check the pattern and length
    const isValid = base64Data.length > 100;
    console.log(`${isValid ? '✅' : '❌'} Validación básica: ${base64Data.length} caracteres`);
    return isValid;
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

  /**
   * Debug method to log image data format
   */
  static debugImageData(data: TrainingData): void {
    console.log('🔍 Debugging training data:');
    console.log(`Total classes: ${data.classes.length}`);
    
    data.classes.forEach((classData, classIndex) => {
      console.log(`\nClase ${classIndex + 1}: "${classData.name}"`);
      console.log(`Total imágenes: ${classData.images.length}`);
      
      classData.images.forEach((image, imageIndex) => {
        if (imageIndex < 2) { // Solo log las primeras 2 imágenes
          console.log(`Imagen ${imageIndex + 1}:`);
          console.log(`- Tipo: ${typeof image}`);
          console.log(`- Longitud: ${image?.length || 0}`);
          console.log(`- Comienza con: ${image?.substring(0, 60) || 'undefined'}...`);
          
          if (typeof image === 'string') {
            const hasDataUrl = image.startsWith('data:image/');
            const hasBase64Marker = image.includes('base64,');
            const isBlobUrl = image.startsWith('blob:');
            console.log(`- Es data URL: ${hasDataUrl}`);
            console.log(`- Tiene base64: ${hasBase64Marker}`);
            console.log(`- Es blob URL: ${isBlobUrl}`);
            
            if (hasDataUrl) {
              const mimeType = image.split(';')[0].split(':')[1];
              console.log(`- Tipo MIME: ${mimeType}`);
            }
          }
        }
      });
    });
  }
}
