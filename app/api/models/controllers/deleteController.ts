import { NextRequest, NextResponse } from 'next/server';
import { FileSystemService } from '../services/fileSystemService';

export class DeleteController {
  static async handleDeleteModel(request: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const modelId = url.searchParams.get('modelId');

      if (!modelId) {
        return NextResponse.json(
          { error: 'modelId requerido' },
          { status: 400 }
        );
      }

      const deleted = await FileSystemService.deleteModel(modelId);
      
      if (!deleted) {
        return NextResponse.json(
          { error: 'Modelo no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Modelo eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando modelo:', error);
      return NextResponse.json(
        { error: 'Error al eliminar el modelo' },
        { status: 500 }
      );
    }
  }
}
