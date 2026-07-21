import dotenv from 'dotenv';
import { createServerApp } from './app';
import { connectDatabase } from './config/database';
import { initVapid } from './modules/notification/push.service';

dotenv.config();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  try {
    console.log('🚀 Starting Great Chat Server...');

    // Connect MongoDB
    await connectDatabase();

    // Initialize Push Notification
    initVapid();

    const server = createServerApp();

    server.listen(PORT, HOST, () => {
      console.log('========================================');
      console.log('✅ Server Started Successfully');
      console.log(`🌐 URL : http://${HOST}:${PORT}`);
      console.log(`📦 Environment : ${process.env.NODE_ENV}`);
      console.log('========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception');
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection');
  console.error(reason);
  process.exit(1);
});