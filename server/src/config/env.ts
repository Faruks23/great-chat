import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT ?? '4000',
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'secret',
  cloudinaryUrl: process.env.CLOUDINARY_URL ?? '',
};
