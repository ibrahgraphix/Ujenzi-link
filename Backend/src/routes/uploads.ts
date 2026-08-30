import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware';

const router = Router();
const uploadController = new UploadController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/image',
  authenticate,
  upload.single('file'),
  asyncHandler(uploadController.uploadImage)
);

export default router;
