import type { Request, Response, NextFunction } from 'express';

/**
 * Error personalizado con código de estado HTTP.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Middleware global de manejo de errores.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Error inesperado
  console.error('[reports-service] Error no controlado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor.',
  });
}
