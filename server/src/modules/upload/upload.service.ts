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

  static async saveFromCloudinary(payload: Partial<{ secure_url: string; public_id: string; bytes: number; resource_type: string; format: string; original_filename?: string; mime_type?: string }>) {
    if (!payload || !payload.secure_url) {
      throw new Error('Missing secure_url from Cloudinary payload');
    }

    const data = {
      originalName: payload.original_filename ?? payload.public_id ?? 'cloudinary-upload',
      filename: payload.public_id ?? String(Date.now()),
      url: payload.secure_url,
      mimeType: payload.mime_type ?? (payload.resource_type ?? 'auto'),
      size: payload.bytes ?? 0,
      resourceType: payload.resource_type ?? 'auto',
      publicId: payload.public_id ?? '',
    };

    return UploadModel.create(data);
  }
}
