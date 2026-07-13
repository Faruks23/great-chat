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
