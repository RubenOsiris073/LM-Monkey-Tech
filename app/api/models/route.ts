import { NextRequest } from 'next/server';
import { GetController, PostController, DeleteController } from './controllers';

export async function GET(request: NextRequest) {
  return GetController.handleGetModels(request);
}

export async function POST(request: NextRequest) {
  return PostController.handleCreateModel(request);
}

export async function DELETE(request: NextRequest) {
  return DeleteController.handleDeleteModel(request);
}
