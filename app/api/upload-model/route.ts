import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const chunk = formData.get('chunk') as Blob;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const fileName = formData.get('fileName') as string;
    const metadata = JSON.parse(formData.get('metadata') as string);

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !fileName) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Crear directorio temporal para los chunks
    const uploadDir = path.join(process.cwd(), 'tmp', 'model-chunks', metadata.sessionId);
    await mkdir(uploadDir, { recursive: true });

    // Guardar el chunk
    const chunkPath = path.join(uploadDir, `${fileName}.part${chunkIndex}`);
    const buffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(chunkPath, buffer);

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      url: chunkPath
    });

  } catch (error) {
    console.error('Error al procesar el chunk:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}
