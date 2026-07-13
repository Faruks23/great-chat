import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from './upload.controller';
import { validateUpload } from './upload.validation';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/', upload.single('file'), validateUpload, uploadFile);

export default router;
