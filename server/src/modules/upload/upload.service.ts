import { Express } from 'express';
import UploadModel from './upload.model';
import { UploadData } from './upload.interface';

export class UploadService {
  static async upload(file: Express.Multer.File | undefined) {
    if (!file) {
      throw new Error('No file provided');
    }

    const data: UploadData = {
      filename: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    };

    return UploadModel.create(data);
  }
}
