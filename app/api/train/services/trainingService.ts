import { TrainingData, TrainingMetrics, CompleteModel } from '../types';
import { TrainingValidationService } from './trainingValidationService';
import { TrainingExecutorService } from './trainingExecutorService';
import { ModelGeneratorService } from './modelGeneratorService';

export class TrainingService {
  
  /**
   * Validates training data to ensure it meets minimum requirements
   */
  static validateTrainingData(data: TrainingData): { isValid: boolean; error?: string } {
    return TrainingValidationService.validateTrainingData(data);
  }

  /**
   * Executes the complete training process
   */
  static async executeTraining(data: TrainingData): Promise<{
    modelId: string;
    history: any;
    metrics: TrainingMetrics;
    modelData: CompleteModel;
  }> {
    // Execute training
    const trainingResult = await TrainingExecutorService.executeTraining(data);
    
    // Generate model
    const modelData = await ModelGeneratorService.generateModel(
      data.classes,
      trainingResult.history,
      trainingResult.modelId
    );
    
    console.log('Proceso de entrenamiento completado:', {
      modelId: trainingResult.modelId,
      finalAccuracy: trainingResult.metrics.accuracy,
      modelSize: modelData.weightsData.length
    });

    return {
      modelId: trainingResult.modelId,
      history: trainingResult.history,
      metrics: trainingResult.metrics,
      modelData
    };
  }

  /**
   * Gets training progress for a given training session
   */
  static getTrainingProgress(trainingId?: string): {
    progress: number;
    currentEpoch: number;
    totalEpochs: number;
    metrics: {
      loss: number;
      accuracy: number;
    };
  } {
    return TrainingExecutorService.getTrainingProgress(trainingId);
  }

  /**
   * Gets training data statistics
   */
  static getTrainingStats(data: TrainingData) {
    return TrainingValidationService.getTrainingStats(data);
  }

  /**
   * Generates a model without training (for testing purposes)
   */
  static async generateModel(classes: TrainingData['classes'], modelId: string): Promise<CompleteModel> {
    // Create mock history for model generation
    const mockHistory = {
      loss: [0.8, 0.6, 0.4, 0.3, 0.25],
      accuracy: [0.6, 0.7, 0.8, 0.85, 0.9],
      val_loss: [0.9, 0.7, 0.5, 0.35, 0.3],
      val_accuracy: [0.55, 0.65, 0.75, 0.8, 0.85]
    };

    return ModelGeneratorService.generateModel(classes, mockHistory, modelId);
  }
}
