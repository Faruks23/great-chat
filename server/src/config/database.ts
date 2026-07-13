import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.databaseUrl, {
      dbName: 'great-chat',
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
