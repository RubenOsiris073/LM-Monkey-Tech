export interface Prediction {
  className: string;
  confidence: number;
}

export interface ModelFiles {
  modelJson: File | null;
  weightsFile: File | null;
  metadataJson: File | null;
}

export interface ModelMetadata {
  modelName?: string;
  name?: string;
  labels: string[]; // Array de nombres de clases - REQUERIDO
  classes?: string[]; // Compatibilidad adicional
  classLabels?: { id: number; name: string }[];
  numClasses?: number;
  inputShape?: number[];
  outputShape?: number[];
  architecture?: string;
  framework?: string;
  version?: string;
  createdAt?: string;
  finalMetrics?: {
    accuracy?: number;
    loss?: number;
  };
}
