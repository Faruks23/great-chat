import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { registerRoutes } from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares';
import { initSockets } from './sockets';
import { initCloudinary } from './config/cloudinary';
import { createServer } from 'http';
import dns from 'node:dns';
import morgan from 'morgan';

dns.setServers(['8.8.8.8', '1.1.1.1']);

export function createApp() {
  const app = express();

  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'https://great-chat-swart.vercel.app',
  ].filter((origin): origin is string => Boolean(origin));

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.use(
    morgan((tokens, req, res) =>
      [
        `📥 ${tokens.method(req, res)}`,
        tokens.url(req, res),
        `| ${tokens.status(req, res)}`,
        `| ${tokens['response-time'](req, res)} ms`,
        `| ${tokens.res(req, res, 'content-length') ?? 0} B`,
        `| ${tokens['remote-addr'](req, res)}`,
      ].join(' ')
    )
  );

  initCloudinary();

  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      service: 'Great Chat API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  registerRoutes(app);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

export function createServerApp() {
  const app = createApp();
  const server = createServer(app);

  initSockets(server);

  return server;
}