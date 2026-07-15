import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT ?? '4000',
  databaseUrl: process.env.DATABASE_URL ?? process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  cloudinaryUrl: process.env.CLOUDINARY_URL ?? '',
  frontendUrl: process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? '',
  corsOrigin: process.env.CORS_ORIGIN ?? '',
};
