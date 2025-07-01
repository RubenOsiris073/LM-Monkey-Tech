export interface ImageData {
  file: File;
  url: string;
  id: string;
  data: string;
}

export interface ClassData {
  name: string;
  images: ImageData[];
  id: string;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valAccuracy?: number;
  progress: number;
}

export interface TrainingClass {
  id: string;
  name: string;
  images: string[];
}
