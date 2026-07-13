import type { Express } from 'express';
import cloudinary from '../../config/cloudinary';
import UploadModel from './upload.model';
import { UploadData } from './upload.interface';

export class UploadService {
  static async upload(file: Express.Multer.File | undefined) {
    if (!file || !file.buffer) {
      throw new Error('No file provided');
    }

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'great-chat/uploads',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      );

      stream.end(file.buffer);
    });

    const data: UploadData = {
      originalName: file.originalname,
      filename: file.originalname,
      url: uploadResult.secure_url,
      mimeType: file.mimetype,
      size: file.size,
      resourceType: uploadResult.resource_type,
      publicId: uploadResult.public_id,
    };

    return UploadModel.create(data);
  }
}
