import { NextRequest, NextResponse } from 'next/server';

interface ModelInfo {
  id: string;
  name: string;
  classes: string[];
  accuracy: number;
  createdAt: string;
  modelSize: number;
  trainedImages: number;
}

// Simular almacenamiento de modelos (en una aplicación real usarías una base de datos)
const modelStorage = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const modelId = url.searchParams.get('modelId');

    if (modelId) {
      // Obtener modelo específico
      const model = modelStorage.get(modelId);
      if (!model) {
        return NextResponse.json(
          { error: 'Modelo no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        model
      });
    } else {
      // Listar todos los modelos
      const models: ModelInfo[] = Array.from(modelStorage.entries()).map(([id, model]) => ({
        id,
        name: model.metadata?.name || id,
        classes: model.metadata?.classes || [],
        accuracy: model.metadata?.finalMetrics?.accuracy || 0,
        createdAt: model.metadata?.createdAt || new Date().toISOString(),
        modelSize: model.metadata?.modelSize || 0,
        trainedImages: model.metadata?.trainedImages || 0
      }));

      return NextResponse.json({
        success: true,
        models: models.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      });
    }
  } catch (error) {
    console.error('Error obteniendo modelos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo modelos: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const modelData = await request.json();
    
    if (!modelData || !modelData.metadata) {
      return NextResponse.json(
        { error: 'Datos de modelo inválidos' },
        { status: 400 }
      );
    }

    const modelId = modelData.metadata.name || `model-${Date.now()}`;
    
    // Guardar modelo en el almacenamiento
    modelStorage.set(modelId, modelData);

    return NextResponse.json({
      success: true,
      modelId,
      message: 'Modelo guardado exitosamente'
    });

  } catch (error) {
    console.error('Error guardando modelo:', error);
    return NextResponse.json(
      { error: 'Error guardando modelo: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const modelId = url.searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json(
        { error: 'ID de modelo requerido' },
        { status: 400 }
      );
    }

    if (!modelStorage.has(modelId)) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 404 }
      );
    }

    modelStorage.delete(modelId);

    return NextResponse.json({
      success: true,
      message: 'Modelo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando modelo:', error);
    return NextResponse.json(
      { error: 'Error eliminando modelo: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
