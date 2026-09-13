import { Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config, supabase } from '../config';
import { AuthRequest, UserRole } from '../models';
import { AppError } from './errorHandler';

// Remote JWKS set initialization (lazy-initialized)
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

const getJWKS = () => {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(config.supabaseJwksUrl));
  }
  return jwks;
};

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

    // Verify token using jose JWKS
    let payload;
    try {
      const result = await jwtVerify(token, getJWKS());
      payload = result.payload;
    } catch (jwtError: any) {
      if (jwtError.code === 'ERR_JWT_EXPIRED' || jwtError.message?.toLowerCase().includes('expired')) {
        throw new AppError(401, 'Token expired');
      }
      throw new AppError(401, 'Invalid token');
    }

    const userId = payload.sub;
    const email = payload.email as string;

    if (!userId) {
      throw new AppError(401, 'Invalid token: Missing subject claim');
    }

    // Fetch user's role from the public users table
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role, must_change_password')
      .eq('id', userId)
      .single();

    if (dbError || !dbUser) {
      throw new AppError(401, 'User profile not found');
    }

    req.user = {
      userId,
      email,
      role: dbUser.role as UserRole,
      mustChangePassword: !!dbUser.must_change_password,
    };
    next();
  } catch (error) {
    next(error);
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

    if (req.user.role === UserRole.ADMIN && req.user.mustChangePassword) {
      res.status(403).json({
        status: 'error',
        code: 'PASSWORD_CHANGE_REQUIRED',
        message: 'Password change required before accessing admin resources'
      });
      return;
    }

    next();
  };
};

export const requireAdminPasswordNotRequired = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === UserRole.ADMIN && req.user.mustChangePassword) {
    res.status(403).json({
      status: 'error',
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'Password change required before accessing admin resources'
    });
    return;
  }
  next();
};
