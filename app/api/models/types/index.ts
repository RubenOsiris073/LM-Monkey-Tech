export interface ModelInfo {
  id: string;
  name: string;
  classes: string[];
  accuracy: number;
  createdAt: string;
  modelSize: number;
  trainedImages: number;
}

export interface ModelMetadata {
  name: string;
  modelName: string;
  classes: string[];
  labels: string[];
  createdAt: string;
  finalMetrics?: {
    accuracy: number;
    loss: number;
  };
  modelSize: number;
  trainedImages: number;
}

export interface StoredModel {
  id: string;
  metadata: ModelMetadata;
  files: {
    'model.json': string;
    'model.weights.bin': Buffer;
    'metadata.json': string;
    'README.txt': string;
  };
}

export interface CreateModelRequest {
  modelId: string;
  modelName?: string;
  files: {
    'model.json': string;
    'model.weights.bin': any;
    'metadata.json': string;
    'README.txt': string;
  };
  metadata?: {
    classes?: string[];
    labels?: string[];
    finalMetrics?: {
      accuracy: number;
      loss: number;
    };
    trainedImages?: number;
  };
}
