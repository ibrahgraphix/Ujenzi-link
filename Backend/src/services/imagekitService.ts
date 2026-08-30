import { imagekit } from '../config';

export type UploadFolderType = 'listings' | 'providers' | 'adverts';

const UPLOAD_TRANSFORM = 'w-1200,h-1200,c-at_max,q-80,f-auto';

export interface UploadedImageResult {
  url: string;
  fileId: string;
}

export interface ImagePayload {
  url: string;
  fileId?: string;
}

export class ImageKitService {
  buildFolderPath(folderType: UploadFolderType, entityId: string): string {
    return `/${folderType}/${entityId}`;
  }

  async uploadImage(
    file: Express.Multer.File,
    folderType: UploadFolderType,
    entityId: string
  ): Promise<UploadedImageResult> {
    const folder = this.buildFolderPath(folderType, entityId);

    const result = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder,
      useUniqueFileName: true,
      transformation: {
        pre: UPLOAD_TRANSFORM,
      },
    });

    if (!result.url || !result.fileId) {
      throw new Error('ImageKit upload did not return url or fileId');
    }

    return {
      url: result.url,
      fileId: result.fileId,
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!fileId) return;

    try {
      await imagekit.deleteFile(fileId);
    } catch (error) {
      console.error(`Failed to delete ImageKit file ${fileId}:`, error);
    }
  }

  async deleteFiles(fileIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(fileIds.filter(Boolean))];
    await Promise.all(uniqueIds.map((id) => this.deleteFile(id)));
  }
}
