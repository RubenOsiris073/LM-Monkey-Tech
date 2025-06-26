import { NextRequest, NextResponse } from 'next/server';

interface ClassificationRequest {
  image: string; // Base64 encoded image
  modelId?: string;
  classes?: string[];
}

interface Prediction {
  className: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: ClassificationRequest = await request.json();
    
    if (!data.image) {
      return NextResponse.json(
        { error: 'No se proporcionó imagen' },
        { status: 400 }
      );
    }

    // Por ahora simularemos la clasificación
    const predictions = await simulateClassification(data);
    
    return NextResponse.json({
      success: true,
      predictions,
      modelId: data.modelId || 'default-model',
      message: 'Clasificación realizada (simulación por compatibilidad)'
    });

  } catch (error) {
    console.error('Error en clasificación:', error);
    return NextResponse.json(
      { error: 'Error durante la clasificación: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

async function simulateClassification(data: ClassificationRequest): Promise<Prediction[]> {
  // Simular un pequeño retraso para el procesamiento
  await new Promise(resolve => setTimeout(resolve, 500));

  // Clases predeterminadas o usar las proporcionadas
  const defaultClasses = ['Manzanas', 'Plátanos', 'Naranjas', 'Fresas', 'Uvas'];
  const classes = data.classes || defaultClasses;
  
  // Generar predicciones simuladas con distribución realista
  const predictions: Prediction[] = classes.map((className, index) => {
    let confidence: number;
    
    if (index === 0) {
      // La primera clase tiene mayor probabilidad
      confidence = 0.6 + Math.random() * 0.3; // 60-90%
    } else if (index === 1) {
      // La segunda clase tiene probabilidad media
      confidence = 0.1 + Math.random() * 0.2; // 10-30%
    } else {
      // Las demás clases tienen probabilidad baja
      confidence = Math.random() * 0.1; // 0-10%
    }
    
    return {
      className,
      confidence: Math.round(confidence * 100) / 100
    };
  });

  // Normalizar para que sumen 1
  const total = predictions.reduce((sum, pred) => sum + pred.confidence, 0);
  predictions.forEach(pred => {
    pred.confidence = Math.round((pred.confidence / total) * 100) / 100;
  });

  // Ordenar por confianza descendente
  return predictions.sort((a, b) => b.confidence - a.confidence);
}
