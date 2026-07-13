import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '1h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret);
}
