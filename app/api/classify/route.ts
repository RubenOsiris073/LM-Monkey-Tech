import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';

interface Prediction {
  className: string;
  confidence: number;
}

interface ModelMetadata {
  labels: string[];
  inputShape: number[];
  modelName: string;
  version: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const image = formData.get('image') as string;
    const sessionId = formData.get('sessionId') as string;
    const modelInfo = JSON.parse(formData.get('modelInfo') as string);

    if (!image || !sessionId || !modelInfo) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Leer metadata de los archivos subidos
    const metadataPath = modelInfo.metadataUrls[0]; // Por ahora usamos solo el primer chunk
    const metadataText = await readFile(metadataPath, 'utf-8');
    const metadata: ModelMetadata = JSON.parse(metadataText);

    if (!metadata.labels || !Array.isArray(metadata.labels)) {
      return NextResponse.json(
        { error: 'El archivo metadata.json debe contener un array de labels válido' },
        { status: 400 }
      );
    }

    // Realizar la clasificación
    try {
      // Por ahora simularemos la clasificación
      const mockPredictions: Prediction[] = metadata.labels.map(label => ({
        className: label,
        confidence: Math.random()
      }));

      // Ordenar por confianza descendente
      mockPredictions.sort((a, b) => b.confidence - a.confidence);

      return NextResponse.json({
        predictions: mockPredictions,
        modelInfo: {
          name: metadata.modelName,
          version: metadata.version,
          inputShape: metadata.inputShape
        }
      });
    } catch (error) {
      console.error('Error al realizar la clasificación:', error);
      return NextResponse.json(
        { error: 'Error al realizar la clasificación' },
        { status: 500 }
      );
    }
    const predictions = await simulateClassificationWithCustomModel(image, metadata);
    
    return NextResponse.json({
      success: true,
      predictions,
      modelName: metadata.modelName || 'Modelo personalizado',
      totalClasses: metadata.labels.length,
      message: 'Clasificación realizada con modelo personalizado (simulación por compatibilidad)'
    });

  } catch (error) {
    console.error('Error en clasificación:', error);
    return NextResponse.json(
      { error: 'Error durante la clasificación: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

async function simulateClassificationWithCustomModel(
  image: string, 
  metadata: ModelMetadata
): Promise<Prediction[]> {
  // Simular un pequeño retraso para el procesamiento
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const labels = metadata.labels;
  
  // Generar predicciones simuladas basadas en las clases del modelo
  const predictions: Prediction[] = labels.map((label, index) => ({
    className: label,
    confidence: Math.random() * 0.4 + (index === 0 ? 0.5 : 0.1) // La primera clase tiene más confianza
  }));

  // Ordenar por confianza descendente
  predictions.sort((a, b) => b.confidence - a.confidence);

  // Normalizar las confianzas para que sumen ~1
  const totalConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0);
  predictions.forEach(p => {
    p.confidence = p.confidence / totalConfidence;
  });

  // Retornar las top 5 predicciones
  return predictions.slice(0, Math.min(5, labels.length));
}
