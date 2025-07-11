import { NextRequest, NextResponse } from 'next/server';
import { TrainingService, TrainingFileService } from '../services';
import { TrainingData, TrainingMetrics } from '../types';

export class TrainingController {
  
  /**
   * Handles POST requests for training models
   */
  static async handlePost(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Check if it's a progress request
      if (body.action === 'progress') {
        return this.handleProgressRequest(body.trainingId);
      }

      // Validate training data
      const trainingData: TrainingData = body;
      const validation = TrainingService.validateTrainingData(trainingData);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: validation.error 
          }, 
          { status: 400 }
        );
      }

      console.log('Iniciando entrenamiento con datos:', {
        classes: trainingData.classes.length,
        totalImages: trainingData.classes.reduce((total, c) => total + c.images.length, 0)
      });

      // Start training process
      const trainingResult = await TrainingService.executeTraining(trainingData);
      
      // Save the trained model to file system
      await TrainingFileService.saveModel(trainingResult.modelId, trainingResult.modelData);
      
      // Create model info file
      const metadata = JSON.parse(trainingResult.modelData.metadata);
      await TrainingFileService.createModelInfoFile(trainingResult.modelId, metadata);

      console.log('Entrenamiento completado:', {
        modelId: trainingResult.modelId,
        accuracy: trainingResult.metrics.accuracy,
        epochs: trainingResult.metrics.epoch
      });

      return NextResponse.json({
        success: true,
        modelId: trainingResult.modelId,
        metrics: trainingResult.metrics,
        history: trainingResult.history,
        modelData: trainingResult.modelData,
        message: 'Modelo entrenado exitosamente'
      });

    } catch (error) {
      console.error('Error en entrenamiento:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Error interno del servidor' 
        }, 
        { status: 500 }
      );
    }
  }

  /**
   * Handles training progress requests
   */
  private static handleProgressRequest(trainingId?: string): NextResponse {
    try {
      const progress = TrainingService.getTrainingProgress(trainingId);
      
      return NextResponse.json({
        success: true,
        ...progress
      });
    } catch (error) {
      console.error('Error getting training progress:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error obteniendo progreso del entrenamiento' 
        }, 
        { status: 500 }
      );
    }
  }

  /**
   * Handles GET requests for training status and information
   */
  static async handleGet(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');

      switch (action) {
        case 'status':
          return this.handleStatusRequest();
        
        case 'progress':
          const trainingId = searchParams.get('trainingId');
          return this.handleProgressRequest(trainingId || undefined);
        
        case 'models':
          return this.handleModelsListRequest();
          
        default:
          return this.handleStatusRequest();
      }
    } catch (error) {
      console.error('Error handling GET request:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error interno del servidor' 
        }, 
        { status: 500 }
      );
    }
  }

  /**
   * Handles training status requests
   */
  private static handleStatusRequest(): NextResponse {
    try {
      const storageInfo = TrainingFileService.getStorageInfo();
      
      return NextResponse.json({
        success: true,
        status: 'ready',
        modelsCount: storageInfo.totalModels,
        totalSize: storageInfo.totalSize,
        availableSpace: storageInfo.availableSpace,
        message: 'Sistema de entrenamiento listo'
      });
    } catch (error) {
      console.error('Error getting training status:', error);
      
      return NextResponse.json({
        success: false,
        status: 'error',
        error: 'Error obteniendo estado del sistema'
      }, { status: 500 });
    }
  }

  /**
   * Handles models list requests
   */
  private static handleModelsListRequest(): NextResponse {
    try {
      const models = TrainingFileService.listModels();
      
      return NextResponse.json({
        success: true,
        models: models.map(modelId => ({
          id: modelId,
          path: TrainingFileService.getModelPath(modelId),
          exists: TrainingFileService.modelExists(modelId)
        }))
      });
    } catch (error) {
      console.error('Error listing models:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error listando modelos' 
        }, 
        { status: 500 }
      );
    }
  }
}
