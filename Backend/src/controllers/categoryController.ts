import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { AppError } from '../middleware';

const categoryService = new CategoryService();

export class CategoryController {
  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await categoryService.getAllCategories();

      res.status(200).json({
        status: 'success',
        data: { categories }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        throw new AppError(400, 'Category ID is required');
      }

      const category = await categoryService.getCategoryById(categoryId);

      res.status(200).json({
        status: 'success',
        data: { category }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(404, error.message);
      }
      throw error;
    }
  };

  getCategoriesWithSubcategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await categoryService.getCategoriesWithSubcategories();

      res.status(200).json({
        status: 'success',
        data: { categories }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, parentId } = req.body;

      if (!name) {
        throw new AppError(400, 'Category name is required');
      }

      const category = await categoryService.createCategory({
        name,
        description,
        parentId
      });

      res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const { name, description, parentId } = req.body;

      if (!categoryId) {
        throw new AppError(400, 'Category ID is required');
      }

      const category = await categoryService.updateCategory(categoryId, {
        name,
        description,
        parentId
      });

      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        throw new AppError(400, 'Category ID is required');
      }

      const result = await categoryService.deleteCategory(categoryId);

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };
}
