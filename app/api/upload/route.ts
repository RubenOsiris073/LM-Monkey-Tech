import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { className, images, sessionId } = data;

    // Crear directorio para la sesión si no existe
    const sessionDir = path.join(process.cwd(), 'tmp', 'training', sessionId);
    const classDir = path.join(sessionDir, className);
    
    await mkdir(sessionDir, { recursive: true });
    await mkdir(classDir, { recursive: true });

    // Guardar imágenes
    const savedImages = await Promise.all(images.map(async (base64: string, index: number) => {
      const imageData = base64.replace(/^data:image\/\w+;base64,/, '');
      const filename = `image_${index}.png`;
      const filePath = path.join(classDir, filename);
      
      const buffer = Buffer.from(imageData, 'base64');
      await writeFile(filePath, buffer);
      
      return filename;
    }));

    return NextResponse.json({
      success: true,
      savedImages,
      message: `Guardadas ${savedImages.length} imágenes para la clase "${className}"`
    });

  } catch (error) {
    console.error('Error al guardar imágenes:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar las imágenes' },
      { status: 500 }
    );
  }
}
