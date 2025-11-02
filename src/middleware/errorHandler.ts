import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode?: number;
  code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Logging selon l'environnement
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    // En production, logger les erreurs importantes (500+)
    if (statusCode >= 500) {
      console.error('Server Error:', {
        message: err.message,
        code: err.code,
        path: _req.path,
        method: _req.method,
        timestamp: new Date().toISOString(),
      });
    }
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

