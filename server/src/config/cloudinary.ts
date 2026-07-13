import { v2 as cloudinary } from 'cloudinary';

export function initCloudinary() {
  cloudinary.config({
    secure: true,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary credentials are not fully configured. File uploads may fail.');
  }

  console.log('Cloudinary initialized');
}

export default cloudinary;
