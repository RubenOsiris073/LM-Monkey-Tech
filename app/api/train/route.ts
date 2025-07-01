import { NextRequest, NextResponse } from 'next/server';
import { TrainingController } from './controllers';

export async function POST(request: NextRequest) {
  return TrainingController.handlePost(request);
}

export async function GET(request: NextRequest) {
  return TrainingController.handleGet(request);
}
