
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error processing ${req.method} ${req.url}:`, err);
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    }
  });
};
