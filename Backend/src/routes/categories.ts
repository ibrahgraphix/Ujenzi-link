import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', asyncHandler(categoryController.getAllCategories));
router.get('/hierarchy', asyncHandler(categoryController.getCategoriesWithSubcategories));
router.get('/:categoryId', asyncHandler(categoryController.getCategoryById));

// Admin-only routes
router.post('/', authenticate, authorize(UserRole.ADMIN), asyncHandler(categoryController.createCategory));
router.put('/:categoryId', authenticate, authorize(UserRole.ADMIN), asyncHandler(categoryController.updateCategory));
router.delete('/:categoryId', authenticate, authorize(UserRole.ADMIN), asyncHandler(categoryController.deleteCategory));

export default router;
