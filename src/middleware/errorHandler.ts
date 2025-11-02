import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
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
        path: req.path,
        method: req.method,
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

