import { StoredModel } from '../types';

export class ZipService {
  static async createModelZip(model: StoredModel): Promise<Buffer> {
    try {
      const JSZip = require('jszip');
      const zip = new JSZip();
      
      zip.file('model.json', model.files['model.json']);
      zip.file('metadata.json', model.files['metadata.json']);
      zip.file('README.txt', model.files['README.txt']);
      zip.file('model.weights.bin', model.files['model.weights.bin']);
      
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      return zipBuffer;
    } catch (error) {
      console.error('Error creating ZIP:', error);
      throw new Error('Failed to create ZIP file');
    }
  }
}
