import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ModelInfo {
  id: string;
  name: string;
  classes: string[];
  accuracy: number;
  createdAt: string;
  modelSize: number;
  trainedImages: number;
}

interface StoredModel {
  id: string;
  metadata: {
    name: string;
    modelName: string;
    classes: string[];
    labels: string[];
    createdAt: string;
    finalMetrics?: {
      accuracy: number;
      loss: number;
    };
    modelSize: number;
    trainedImages: number;
  };
  files: {
    'model.json': string;
    'model.weights.bin': Buffer;
    'metadata.json': string;
    'README.txt': string;
  };
}

// Directorio para almacenar modelos
const MODELS_DIR = path.join(process.cwd(), 'stored-models');

// Asegurar que el directorio existe
async function ensureModelsDir() {
  try {
    await fs.access(MODELS_DIR);
  } catch {
    await fs.mkdir(MODELS_DIR, { recursive: true });
  }
}

// Guardar modelo en el sistema de archivos
async function saveModelToFileSystem(model: StoredModel) {
  await ensureModelsDir();
  
  const modelDir = path.join(MODELS_DIR, model.id);
  await fs.mkdir(modelDir, { recursive: true });
  
  // Guardar archivos del modelo
  await fs.writeFile(path.join(modelDir, 'model.json'), model.files['model.json']);
  await fs.writeFile(path.join(modelDir, 'model.weights.bin'), model.files['model.weights.bin']);
  await fs.writeFile(path.join(modelDir, 'metadata.json'), model.files['metadata.json']);
  await fs.writeFile(path.join(modelDir, 'README.txt'), model.files['README.txt']);
  
  // Guardar información del modelo
  await fs.writeFile(
    path.join(modelDir, 'model-info.json'), 
    JSON.stringify(model.metadata, null, 2)
  );
}

// Cargar modelo del sistema de archivos
async function loadModelFromFileSystem(modelId: string): Promise<StoredModel | null> {
  try {
    await ensureModelsDir();
    const modelDir = path.join(MODELS_DIR, modelId);
    
    // Verificar que existe
    await fs.access(modelDir);
    
    // Cargar archivos
    const modelJson = await fs.readFile(path.join(modelDir, 'model.json'), 'utf-8');
    const weightsBuffer = await fs.readFile(path.join(modelDir, 'model.weights.bin'));
    const metadataJson = await fs.readFile(path.join(modelDir, 'metadata.json'), 'utf-8');
    const readmeText = await fs.readFile(path.join(modelDir, 'README.txt'), 'utf-8');
    const modelInfo = await fs.readFile(path.join(modelDir, 'model-info.json'), 'utf-8');
    
    return {
      id: modelId,
      metadata: JSON.parse(modelInfo),
      files: {
        'model.json': modelJson,
        'model.weights.bin': weightsBuffer,
        'metadata.json': metadataJson,
        'README.txt': readmeText
      }
    };
  } catch {
    return null;
  }
}

// Listar todos los modelos
async function listAllModels(): Promise<ModelInfo[]> {
  try {
    await ensureModelsDir();
    const modelDirs = await fs.readdir(MODELS_DIR);
    const models: ModelInfo[] = [];
    
    for (const dir of modelDirs) {
      try {
        const modelInfoPath = path.join(MODELS_DIR, dir, 'model-info.json');
        const modelInfo = JSON.parse(await fs.readFile(modelInfoPath, 'utf-8'));
        
        models.push({
          id: dir,
          name: modelInfo.name || modelInfo.modelName || dir,
          classes: modelInfo.classes || modelInfo.labels || [],
          accuracy: modelInfo.finalMetrics?.accuracy || 0,
          createdAt: modelInfo.createdAt || new Date().toISOString(),
          modelSize: modelInfo.modelSize || 0,
          trainedImages: modelInfo.trainedImages || 0
        });
      } catch (error) {
        console.error(`Error loading model ${dir}:`, error);
      }
    }
    
    return models.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

// Eliminar modelo del sistema de archivos
async function deleteModelFromFileSystem(modelId: string): Promise<boolean> {
  try {
    const modelDir = path.join(MODELS_DIR, modelId);
    await fs.rm(modelDir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const modelId = url.searchParams.get('modelId');
    const download = url.searchParams.get('download') === 'true';

    if (modelId) {
      // Obtener modelo específico
      const model = await loadModelFromFileSystem(modelId);
      if (!model) {
        return NextResponse.json(
          { error: 'Modelo no encontrado' },
          { status: 404 }
        );
      }

      if (download) {
        // Descargar modelo como ZIP
        const JSZip = require('jszip');
        const zip = new JSZip();
        
        zip.file('model.json', model.files['model.json']);
        zip.file('metadata.json', model.files['metadata.json']);
        zip.file('README.txt', model.files['README.txt']);
        zip.file('model.weights.bin', model.files['model.weights.bin']);
        
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        
        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${model.metadata.name || modelId}.zip"`
          }
        });
      }

      return NextResponse.json({
        success: true,
        model
      });
    } else {
      // Listar todos los modelos
      const models = await listAllModels();

      return NextResponse.json({
        success: true,
        models
      });
    }
  } catch (error) {
    console.error('Error en API de modelos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { modelId, modelName, files, metadata } = data;

    if (!modelId || !files) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (modelId, files)' },
        { status: 400 }
      );
    }

    // Convertir los pesos de array a Buffer si es necesario
    let weightsBuffer: Buffer;
    if (Buffer.isBuffer(files['model.weights.bin'])) {
      weightsBuffer = files['model.weights.bin'];
    } else if (Array.isArray(files['model.weights.bin'])) {
      weightsBuffer = Buffer.from(new Float32Array(files['model.weights.bin']).buffer);
    } else {
      return NextResponse.json(
        { error: 'Formato de pesos no válido' },
        { status: 400 }
      );
    }

    const model: StoredModel = {
      id: modelId,
      metadata: {
        name: modelName || modelId,
        modelName: modelName || modelId,
        classes: metadata?.classes || [],
        labels: metadata?.labels || metadata?.classes || [],
        createdAt: new Date().toISOString(),
        finalMetrics: metadata?.finalMetrics,
        modelSize: weightsBuffer.length + (files['model.json']?.length || 0),
        trainedImages: metadata?.trainedImages || 0
      },
      files: {
        'model.json': files['model.json'],
        'model.weights.bin': weightsBuffer,
        'metadata.json': files['metadata.json'],
        'README.txt': files['README.txt']
      }
    };

    await saveModelToFileSystem(model);

    return NextResponse.json({
      success: true,
      message: 'Modelo guardado exitosamente',
      modelId
    });

  } catch (error) {
    console.error('Error guardando modelo:', error);
    return NextResponse.json(
      { error: 'Error al guardar el modelo' },
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
        { error: 'modelId requerido' },
        { status: 400 }
      );
    }

    const deleted = await deleteModelFromFileSystem(modelId);
    
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
