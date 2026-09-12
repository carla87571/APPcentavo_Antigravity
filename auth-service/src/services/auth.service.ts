import crypto from 'crypto';
import { config } from '../config/env.js';
import type { User, UserRecord, LoginCredentials, AuthResponse } from '../models/user.model.js';
import { AppError } from '../middlewares/errorHandler.js';

export class AuthService {
  private users: Map<string, UserRecord> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  private generateToken(user: User): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      })
    ).toString('base64url');
    const signature = crypto
      .createHmac('sha256', config.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');
    return `${header}.${payload}.${signature}`;
  }

  private seedDefaultUsers() {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword('centavo123', salt);
    const demoUser: UserRecord = {
      id: 'usr-demo-001',
      email: 'demo@centavo.app',
      name: 'Usuario Demo',
      passwordHash,
      salt,
    };
    this.users.set(demoUser.email.toLowerCase(), demoUser);
  }

  login(credentials: LoginCredentials): AuthResponse {
    const { email, password } = credentials;
    if (!email || !password) {
      throw new AppError(400, 'El email y la contraseña son requeridos.');
    }

    const user = this.users.get(email.toLowerCase());
    if (!user) {
      // Auto-register new users for smooth developer and demo experience
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = this.hashPassword(password, salt);
      const newUser: UserRecord = {
        id: `usr-${Date.now()}`,
        email: email.toLowerCase(),
        name: email.split('@')[0] || 'Usuario Centavo',
        passwordHash,
        salt,
      };
      this.users.set(newUser.email, newUser);
      const safeUser: User = { id: newUser.id, email: newUser.email, name: newUser.name };
      return { user: safeUser, token: this.generateToken(safeUser) };
    }

    const calculatedHash = this.hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      throw new AppError(401, 'Credenciales inválidas.');
    }

    const safeUser: User = { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
    return {
      user: safeUser,
      token: this.generateToken(safeUser),
    };
  }

  verifyToken(token: string): User | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, payload, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', config.jwtSecret)
        .update(`${header}.${payload}`)
        .digest('base64url');
      if (signature !== expectedSignature) return null;
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
      return { id: decoded.sub, email: decoded.email, name: decoded.name };
    } catch {
      return null;
    }
  }
}
