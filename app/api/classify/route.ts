import { NextRequest, NextResponse } from 'next/server';

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
    const modelJson = formData.get('modelJson') as File;
    const weightsFile = formData.get('weightsFile') as File;
    const metadataJson = formData.get('metadataJson') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No se proporcionó imagen' },
        { status: 400 }
      );
    }

    if (!modelJson || !weightsFile || !metadataJson) {
      return NextResponse.json(
        { error: 'Se requieren los 3 archivos del modelo: model.json, weights.bin y metadata.json' },
        { status: 400 }
      );
    }

    // Leer y parsear metadata
    const metadataText = await metadataJson.text();
    const metadata: ModelMetadata = JSON.parse(metadataText);

    if (!metadata.labels || !Array.isArray(metadata.labels)) {
      return NextResponse.json(
        { error: 'El archivo metadata.json debe contener un array de labels válido' },
        { status: 400 }
      );
    }

    // Simular la clasificación con el modelo personalizado
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
