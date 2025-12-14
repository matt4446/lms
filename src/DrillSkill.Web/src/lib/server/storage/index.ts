import { env } from '$env/dynamic/private';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync, createReadStream as fsCreateReadStream } from 'node:fs';

const STORAGE_PATH = env.STORAGE_PATH || './uploads';

export interface StorageService {
  saveFile(fileName: string, buffer: Buffer | Uint8Array): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
  exists(fileName: string): Promise<boolean>;
  getFilePath(fileName: string): string;
  getFileSize(fileName: string): Promise<number>;
  createReadStream(fileName: string): ReadableStream;
  
  // Chunked Uploads
  initiateUpload(uploadId: string): Promise<void>;
  appendTempChunk(uploadId: string, buffer: Buffer | Uint8Array): Promise<void>;
  finalizeUpload(uploadId: string, destFileName: string): Promise<string>;
  cancelUpload(uploadId: string): Promise<void>;
}

class LocalStorageService implements StorageService {
  private basePath: string;
  private tempPath: string;

  constructor() {
    this.basePath = path.resolve(process.cwd(), STORAGE_PATH);
    this.tempPath = path.join(this.basePath, 'temp');
    this.ensureDir(this.basePath);
    this.ensureDir(this.tempPath);
  }

  private async ensureDir(dirPath: string) {
    if (!existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  getFilePath(fileName: string): string {
    return path.join(this.basePath, fileName);
  }

  async saveFile(fileName: string, buffer: Buffer | Uint8Array): Promise<string> {
    const filePath = this.getFilePath(fileName);
    const destDir = path.dirname(filePath);
    await this.ensureDir(destDir);
    await fs.writeFile(filePath, buffer);
    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = this.getFilePath(fileName);
    if (await this.exists(fileName)) {
      await fs.unlink(filePath);
    }
  }

  async exists(fileName: string): Promise<boolean> {
    const filePath = this.getFilePath(fileName);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileSize(fileName: string): Promise<number> {
    const filePath = this.getFilePath(fileName);
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  createReadStream(fileName: string): ReadableStream {
    const filePath = this.getFilePath(fileName);
    const stream = fsCreateReadStream(filePath);
    
    return new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      }
    });
  }

  // --- Chunked Uploads ---

  async initiateUpload(uploadId: string): Promise<void> {
    const filePath = path.join(this.tempPath, uploadId);
    await fs.writeFile(filePath, Buffer.alloc(0));
  }

  async appendTempChunk(uploadId: string, buffer: Buffer | Uint8Array): Promise<void> {
    const filePath = path.join(this.tempPath, uploadId);
    await fs.appendFile(filePath, buffer);
  }

  async finalizeUpload(uploadId: string, destFileName: string): Promise<string> {
    const tempFile = path.join(this.tempPath, uploadId);
    const destFile = this.getFilePath(destFileName);
    
    // Ensure dest dir exists (if filename has subdirs)
    const destDir = path.dirname(destFile);
    await this.ensureDir(destDir);

    await fs.rename(tempFile, destFile);
    return destFileName;
  }

  async cancelUpload(uploadId: string): Promise<void> {
    const tempFile = path.join(this.tempPath, uploadId);
    try {
      await fs.unlink(tempFile);
    } catch {
      // Ignore
    }
  }
}

export const storageService = new LocalStorageService();
