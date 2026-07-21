import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { registerRoutes } from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares';
import { initSockets } from './sockets';
import { connectDatabase } from './config/database';
import { initCloudinary } from './config/cloudinary';
import { createServer } from 'http';
import dns from 'node:dns';
import morgan from 'morgan';
dns.setServers(["8.8.8.8", "1.1.1.1"]);
export function createApp() {
  const app = express();
  const allowedOrigins = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL, process.env.CLIENT_URL]
    .filter((value): value is string => Boolean(value));

  app.use(cors({
    origin:'https://great-chat-swart.vercel.app' ,
    credentials: true,
  }));
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens['remote-addr'](req, res),
    ].join(' ')
  }));

  connectDatabase();
  initCloudinary();

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'great-chat-server' });
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
