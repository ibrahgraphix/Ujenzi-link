import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService';
import { UserRole, BuyerType, ProviderType } from '../models';
import { AppError } from '../middleware';

const authService = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        email,
        password,
        name,
        phone,
        role,
        buyerType,
        providerType,
        businessName,
        description,
        locationId
      } = req.body;

      // Validate required fields
      if (!email || !password || !name || !phone || !role) {
        throw new AppError(400, 'Missing required fields');
      }

      // Validate role-specific fields
      if (role === UserRole.BUYER && !buyerType) {
        throw new AppError(400, 'buyerType is required for buyer registration');
      }

      if (role === UserRole.PROVIDER && (!providerType || !businessName)) {
        throw new AppError(400, 'providerType and businessName are required for provider registration');
      }

      const user = await authService.registerUser({
        email,
        password,
        name,
        phone,
        role,
        buyerType,
        providerType,
        businessName,
        description,
        locationId
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(400, 'Email and password are required');
      }

      const user = await authService.loginUser(email, password);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(401, error.message);
      }
      throw error;
    }
  };
}
