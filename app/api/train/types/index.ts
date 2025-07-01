export interface TrainingData {
  classes: {
    name: string;
    images: string[]; // Base64 encoded images
  }[];
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface TrainingHistory {
  loss: number[];
  accuracy: number[];
  val_loss: number[];
  val_accuracy: number[];
}

export interface ModelTopology {
  modelTopology: {
    class_name: string;
    config: {
      name: string;
      layers: any[];
    };
  };
  format: string;
  generatedBy: string;
  convertedBy: string;
}

export interface WeightsManifest {
  paths: string[];
  weights: {
    name: string;
    shape: number[];
    dtype: string;
  }[];
}

export interface ModelMetadata {
  modelName: string;
  name: string;
  labels: string[];
  classes: string[];
  classLabels: { id: number; name: string }[];
  numClasses: number;
  inputShape: number[];
  outputShape: number[];
  architecture: string;
  framework: string;
  version: string;
  createdAt: string;
  trainedImages: number;
  epochs: number;
  batchSize: number;
  optimizer: string;
  learningRate: number;
  loss: string;
  metrics: string[];
  finalMetrics: {
    accuracy: number;
    loss: number;
    val_accuracy: number;
    val_loss: number;
  };
  trainingHistory: TrainingHistory;
  modelSize: number;
  preprocessingConfig: {
    imageSize: number[];
    normalization: string;
    channels: number;
    dataFormat: string;
  };
  modelFiles: {
    model: string;
    weights: string;
    metadata: string;
  };
  compatibilityVersion: string;
}

export interface CompleteModel {
  modelTopology: string;
  weightsManifest: WeightsManifest[];
  weightsData: number[];
  metadata: string;
  format: string;
  files: {
    'model.json': string;
    'model.weights.bin': number[];
    'metadata.json': string;
    'README.txt': string;
  };
}

export interface TrainingProgress {
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  metrics: {
    loss: number;
    accuracy: number;
  };
}
