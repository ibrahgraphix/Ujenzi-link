import { Response } from 'express';
import { AppError } from '../middleware';
import { AuthRequest } from '../models';
import { ImageKitService, UploadFolderType } from '../services/imagekitService';

const imageKitService = new ImageKitService();

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export class UploadController {
  uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const file = req.file;
      if (!file) {
        throw new AppError(400, 'No file uploaded');
      }

      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        throw new AppError(400, 'Only image files (JPEG, PNG, WebP, GIF) are allowed');
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new AppError(400, 'Image must be 5MB or smaller');
      }

      const folderType = req.body.folderType as UploadFolderType;
      if (!folderType || !['listings', 'providers', 'adverts'].includes(folderType)) {
        throw new AppError(400, 'folderType must be listings, providers, or adverts');
      }

      const entityId = (req.body.entityId as string) || `draft-${req.user.userId}`;

      const result = await imageKitService.uploadImage(file, folderType, entityId);

      res.status(201).json({
        status: 'success',
        message: 'Image uploaded successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };
}
