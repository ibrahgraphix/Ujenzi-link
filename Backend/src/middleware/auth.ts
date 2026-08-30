import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, AuthRequest, UserRole } from '../models';
import { AppError } from './errorHandler';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided');
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token expired');
    }
    throw error;
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }

    next();
  };
};
