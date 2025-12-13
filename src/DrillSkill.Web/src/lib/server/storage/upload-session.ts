import { storageService } from './index';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

// In-memory store for upload sessions (could be Redis in production)
// Map<uploadId, SessionData>
const uploadSessions = new Map<string, UploadSession>();

export interface UploadSession {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number; // Expected total size
  uploadedSize: number;
  mimeType: string;
  createdAt: Date;
  expiresAt: Date;
}

export const initUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string(),
});

export class UploadSessionService {
  
  async createSession(userId: string, data: z.infer<typeof initUploadSchema>): Promise<UploadSession> {
    const id = randomUUID();
    const session: UploadSession = {
      id,
      userId,
      fileName: data.fileName,
      fileSize: data.fileSize,
      uploadedSize: 0,
      mimeType: data.mimeType,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    uploadSessions.set(id, session);
    await storageService.initiateUpload(id);
    
    return session;
  }

  getSession(id: string): UploadSession | undefined {
    const session = uploadSessions.get(id);
    if (session && session.expiresAt < new Date()) {
      this.cleanupSession(id);
      return undefined;
    }
    return session;
  }

  async appendChunk(id: string, chunk: Buffer | Uint8Array): Promise<UploadSession> {
    const session = this.getSession(id);
    if (!session) throw new Error('Session not found or expired');

    await storageService.appendTempChunk(id, chunk);
    session.uploadedSize += chunk.length;
    
    // Update session
    uploadSessions.set(id, session);
    
    return session;
  }

  async finalizeSession(id: string): Promise<string> {
    const session = this.getSession(id);
    if (!session) throw new Error('Session not found');

    if (session.uploadedSize !== session.fileSize) {
        console.warn(`Finalizing upload ${id} with size mismatch: ${session.uploadedSize}/${session.fileSize}`);
    }

    // Generate a final filename (e.g., timestamp-originalName) to avoid collisions
    const finalFileName = `${Date.now()}-${session.fileName}`;
    await storageService.finalizeUpload(id, finalFileName);
    
    uploadSessions.delete(id);
    return finalFileName;
  }

  async cancelSession(id: string): Promise<void> {
    await storageService.cancelUpload(id);
    uploadSessions.delete(id);
  }

  private async cleanupSession(id: string) {
    await this.cancelSession(id);
  }
}

export const uploadSessionService = new UploadSessionService();
