import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AuthCredentials, AuthResponse } from './auth.interface';
import UserModel from '../user/user.model';
import AuthUserModel from './auth.model';

const createToken = (user: { _id: string; email?: string; phone?: string }) =>
  jwt.sign({ id: user._id.toString(), email: user.email, phone: user.phone }, env.jwtSecret, { expiresIn: '7d' });

const isBcryptHash = (value: string) => typeof value === 'string' && value.startsWith('$2');

export class AuthService {
  private static async findUserByCredentials(normalizedEmail?: string, normalizedPhone?: string) {
    const currentUser = await UserModel.findOne({
      $or: [
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    }).lean();

    if (currentUser) {
      return { user: currentUser, source: 'user' as const };
    }

    const legacyUser = normalizedEmail
      ? await AuthUserModel.findOne({ email: normalizedEmail }).lean()
      : null;

    if (legacyUser) {
      return { user: legacyUser, source: 'legacy' as const };
    }

    return null;
  }

  static async refresh(payload: { token?: string }) {
    const token = payload.token;
    if (!token) {
      throw new Error('Missing token');
    }

    const decoded = jwt.verify(token, env.jwtSecret) as { id: string; email?: string; phone?: string };
    return {
      user: {
        id: decoded.id,
        email: decoded.email ?? '',
        name: decoded.email ?? 'User',
      },
      token: createToken({ _id: decoded.id, email: decoded.email, phone: decoded.phone }),
    };
  }

  static async register(credentials: AuthCredentials): Promise<AuthResponse> {
    const normalizedEmail = credentials.email?.toLowerCase().trim();
    const normalizedPhone = credentials.phone?.trim();

    if (!normalizedEmail && !normalizedPhone) {
      throw new Error('Please provide an email or phone number');
    }

    const existingUser = await this.findUserByCredentials(normalizedEmail, normalizedPhone);

    if (existingUser) {
      throw new Error('An account with this email or phone already exists');
    }

    const hashedPassword = await bcrypt.hash(credentials.password, 10);
    const user = await UserModel.create({
      name: credentials.name?.trim() || 'User',
      email: normalizedEmail || undefined,
      phone: normalizedPhone || undefined,
      password: hashedPassword,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      token: createToken(user),
    };
  }

  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const normalizedEmail = credentials.email?.toLowerCase().trim();
    const normalizedPhone = credentials.phone?.trim();

    const foundUser = await this.findUserByCredentials(normalizedEmail, normalizedPhone);

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const { user, source } = foundUser;
    const storedPassword = user.password;
    if (!storedPassword) {
      throw new Error('Invalid credentials');
    }

    let validPassword = false;
    if (isBcryptHash(storedPassword)) {
      validPassword = await bcrypt.compare(credentials.password, storedPassword);
    } else {
      validPassword = storedPassword === credentials.password;
    }

    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    if (!isBcryptHash(storedPassword)) {
      const hashedPassword = await bcrypt.hash(credentials.password, 10);
      if (source === 'user') {
        await UserModel.updateOne({ _id: user._id }, { password: hashedPassword });
      } else {
        await AuthUserModel.updateOne({ _id: user._id }, { password: hashedPassword });
      }
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email ?? '',
        name: user.name,
      },
      token: createToken(user),
    };
  }
}
