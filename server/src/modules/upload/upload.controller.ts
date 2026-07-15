import { Request, Response, NextFunction } from 'express';
import { UploadService } from './upload.service';

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const file = await UploadService.upload(req.file);
    res.status(201).json(file);
  } catch (error) {
    next(error);
  }
}

export async function saveCloudinaryAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const saved = await UploadService.saveFromCloudinary(payload);
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
}

// Endpoint to receive Cloudinary upload notifications (notification_url set on upload preset)
export async function cloudinaryNotify(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    // Cloudinary sends different shapes; try to extract secure_url
    const secure_url = payload.secure_url ?? payload.data?.secure_url ?? payload.result?.secure_url;
    const public_id = payload.public_id ?? payload.data?.public_id ?? payload.result?.public_id;
    const bytes = payload.bytes ?? payload.data?.bytes ?? payload.result?.bytes;
    const resource_type = payload.resource_type ?? payload.data?.resource_type ?? payload.result?.resource_type;
    const format = payload.format ?? payload.data?.format ?? payload.result?.format;
    const mime_type = payload.mime_type ?? payload.data?.mime_type ?? payload.result?.mime_type;

    if (!secure_url) {
      // Nothing to save
      res.status(200).json({ ok: true, message: 'no secure_url' });
      return;
    }

    const saved = await UploadService.saveFromCloudinary({ secure_url, public_id, bytes, resource_type, format, mime_type });
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
}
