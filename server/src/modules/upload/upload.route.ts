import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from './upload.controller';
import { validateUpload } from './upload.validation';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});
const router = Router();

router.post('/', upload.single('file'), validateUpload, uploadFile);

export default router;
