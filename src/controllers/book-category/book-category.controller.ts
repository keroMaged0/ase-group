import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { NotFound } from '../../errors/notfound-error';
import { ErrCodes } from '../../types/error-code';
import { SuccessResponse } from '../../types/responses';
import { Errors } from '../../errors';
import { Category } from '../../models/book-category.model';

export const create: RequestHandler<unknown, SuccessResponse, { name: string }> = async (
  req,
  res,
  next,
) => {
  const categoryRepository = dataSource.getRepository(Category);

  try {
    const newCategory = await categoryRepository.save({
      name: req.body.name,
    });

    res.status(201).json({
      success: true,
      message: 'Category Created Successfully',
      data: newCategory,
    });
  } catch (error) {
    return next(new Errors.BadRequest(ErrCodes.BAD_REQUEST));
  }
};

export const getCategories: RequestHandler<{ id?: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  const categoryRepository = dataSource.getRepository(Category);

  if (id) {
    const category = await categoryRepository.findOneBy({ id });
    if (!category) {
      return next(new NotFound(ErrCodes.NOT_FOUND));
    }
    return res.status(201).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  }

  const categories = await categoryRepository.find();
  return res.status(201).json({
    success: true,
    message: 'All categories retrieved successfully',
    data: categories,
  });
};

export const update: RequestHandler<{ id: string }, SuccessResponse, { name: string }> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  const { name } = req.body;

  const categoryRepository = dataSource.getRepository(Category);
  const categoryToUpdate = await categoryRepository.findOneBy({ id });
  if (!categoryToUpdate) {
    return next(new NotFound(ErrCodes.NOT_FOUND));
  }

  await categoryRepository.update(id, { ...(name && { name }), updated_at: new Date() });

  const updatedCategory = await categoryRepository.findOneBy({ id });
  return res.status(201).json({
    success: true,
    message: 'Category Updated Successfully',
    data: updatedCategory,
  });
};

export const remove: RequestHandler<{ id: string }, SuccessResponse> = async (req, res, next) => {
  const categoryRepository = dataSource.getRepository(Category);
  const result = await categoryRepository.delete({ id: req.params.id });

  if (result.affected === 0) {
    return next(new NotFound(ErrCodes.NOT_FOUND));
  }

  return res.status(200).json({
    success: true,
    message: 'Category Deleted Successfully',
    data: null,
  });
};
