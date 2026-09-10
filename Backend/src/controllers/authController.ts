import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserRole, BuyerType, ProviderType, AvailabilityStatus } from '../models';
import { AppError } from '../middleware';

const authService = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Register request body:', req.body);

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
        locationId,
        availabilityStatus,
        institutionName,
        projectName,
        projectDescription
      } = req.body;

      // Validate required fields
      if (!email || !password || !name || !phone || !role) {
        console.error('Missing required fields:', { email: !!email, password: !!password, name: !!name, phone: !!phone, role: !!role });
        throw new AppError(400, 'Missing required fields');
      }

      // Validate role-specific fields
      if (role === UserRole.BUYER && !buyerType) {
        console.error('Missing buyerType for buyer registration');
        throw new AppError(400, 'buyerType is required for buyer registration');
      }

      if (role === UserRole.PROVIDER && (!providerType || !businessName)) {
        console.error('Missing providerType or businessName for provider registration:', { providerType, businessName });
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
        locationId,
        availabilityStatus,
        institutionName,
        projectName,
        projectDescription
      });

      // Log in automatically to retrieve real Supabase access token
      const loginResult = await authService.loginUser(email, password);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.full_name,
            phone: user.phone,
            role: user.role
          },
          token: loginResult.token
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

      const { user, token } = await authService.loginUser(email, password);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: (user as any).full_name || (user as any).name || '',
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
