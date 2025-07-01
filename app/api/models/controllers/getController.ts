import { NextRequest, NextResponse } from 'next/server';
import { FileSystemService } from '../services/fileSystemService';
import { ZipService } from '../services/zipService';

export class GetController {
  static async handleGetModels(request: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const modelId = url.searchParams.get('modelId');
      const download = url.searchParams.get('download') === 'true';

      if (modelId) {
        return await this.handleGetSingleModel(modelId, download);
      } else {
        return await this.handleGetAllModels();
      }
    } catch (error) {
      console.error('Error en GET models:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }

  private static async handleGetSingleModel(modelId: string, download: boolean): Promise<NextResponse> {
    const model = await FileSystemService.loadModel(modelId);
    
    if (!model) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 404 }
      );
    }

    if (download) {
      try {
        const zipBuffer = await ZipService.createModelZip(model);
        
        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${model.metadata.name || modelId}.zip"`
          }
        });
      } catch (zipError) {
        console.error('Error creating ZIP:', zipError);
        // Fallback to JSON response if ZIP creation fails
        return NextResponse.json({
          success: true,
          model
        });
      }
    }

    return NextResponse.json({
      success: true,
      model
    });
  }

  private static async handleGetAllModels(): Promise<NextResponse> {
    const models = await FileSystemService.listModels();

    return NextResponse.json({
      success: true,
      models
    });
  }
}
