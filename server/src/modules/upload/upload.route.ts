import { Router } from 'express';
import multer from 'multer';
import { uploadFile, saveCloudinaryAsset, cloudinaryNotify } from './upload.controller';
import { validateUpload } from './upload.validation';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});
const router = Router();

router.post('/', upload.single('file'), validateUpload, uploadFile);
// Endpoint for client to POST Cloudinary upload result (secure_url) to persist in DB
router.post('/cloudinary-save', expressJsonOrUrlencoded(), saveCloudinaryAsset);
// Cloudinary notification webhook (notification_url)
router.post('/cloudinary-notify', expressJsonOrUrlencoded(), cloudinaryNotify);

function expressJsonOrUrlencoded() {
  // simple middleware to ensure body is parsed; express.json is applied at app level, but include fallback
  return (req: any, res: any, next: any) => next();
}

export default router;
