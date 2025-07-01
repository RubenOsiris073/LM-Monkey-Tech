import { NextRequest, NextResponse } from 'next/server';
import { FileSystemService } from '../services/fileSystemService';
import { ValidationService } from '../services/validationService';
import { CreateModelRequest } from '../types';

export class PostController {
  static async handleCreateModel(request: NextRequest): Promise<NextResponse> {
    try {
      const data: CreateModelRequest = await request.json();
      
      // Validar datos de entrada
      const validation = ValidationService.validateCreateModelRequest(data);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Procesar buffer de pesos
      let weightsBuffer: Buffer;
      try {
        weightsBuffer = ValidationService.processWeightsBuffer(data.files['model.weights.bin']);
      } catch (error) {
        return NextResponse.json(
          { error: (error as Error).message },
          { status: 400 }
        );
      }

      // Crear modelo estructurado
      const model = ValidationService.createStoredModel(data, weightsBuffer);

      // Guardar modelo
      await FileSystemService.saveModel(model);

      return NextResponse.json({
        success: true,
        message: 'Modelo guardado exitosamente',
        modelId: data.modelId
      });

    } catch (error) {
      console.error('Error guardando modelo:', error);
      return NextResponse.json(
        { error: 'Error al guardar el modelo' },
        { status: 500 }
      );
    }
  }
}
