import { CreateModelRequest, StoredModel } from '../types';

export class ValidationService {
  static validateCreateModelRequest(data: CreateModelRequest): { isValid: boolean; error?: string } {
    if (!data.modelId || !data.files) {
      return { isValid: false, error: 'Faltan datos requeridos (modelId, files)' };
    }

    if (!data.files['model.json'] || !data.files['model.weights.bin'] || !data.files['metadata.json'] || !data.files['README.txt']) {
      return { isValid: false, error: 'Faltan archivos requeridos del modelo' };
    }

    return { isValid: true };
  }

  static processWeightsBuffer(weights: any): Buffer {
    if (Buffer.isBuffer(weights)) {
      return weights;
    } else if (Array.isArray(weights)) {
      return Buffer.from(new Float32Array(weights).buffer);
    } else {
      throw new Error('Formato de pesos no válido');
    }
  }

  static createStoredModel(data: CreateModelRequest, weightsBuffer: Buffer): StoredModel {
    return {
      id: data.modelId,
      metadata: {
        name: data.modelName || data.modelId,
        modelName: data.modelName || data.modelId,
        classes: data.metadata?.classes || [],
        labels: data.metadata?.labels || data.metadata?.classes || [],
        createdAt: new Date().toISOString(),
        finalMetrics: data.metadata?.finalMetrics,
        modelSize: weightsBuffer.length + (data.files['model.json']?.length || 0),
        trainedImages: data.metadata?.trainedImages || 0
      },
      files: {
        'model.json': data.files['model.json'],
        'model.weights.bin': weightsBuffer,
        'metadata.json': data.files['metadata.json'],
        'README.txt': data.files['README.txt']
      }
    };
  }
}
