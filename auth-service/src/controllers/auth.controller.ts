import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../services/auth.service.js';
import { AppError } from '../middlewares/errorHandler.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError(400, 'Correo electrónico y contraseña requeridos.');
      }
      const result = this.authService.login({ email, password });
      res.status(200).json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (err) {
      next(err);
    }
  };

  me = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      if (!token) {
        throw new AppError(401, 'Token no suministrado.');
      }
      const user = this.authService.verifyToken(token);
      if (!user) {
        throw new AppError(401, 'Token inválido o expirado.');
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (err) {
      next(err);
    }
  };
}
