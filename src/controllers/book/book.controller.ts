import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { NotFound } from '../../errors/notfound-error';
import { ErrCodes } from '../../types/error-code';
import { SuccessResponse } from '../../types/responses';
import { Book } from '../../models/book.model';

interface CreateBookBody {
  title: string;
  fileUrl: string;
  category_id: string;
}

export const create: RequestHandler<unknown, SuccessResponse, CreateBookBody> = async (
  req,
  res,
  next,
) => {
  const userId = req.loggedUser.id;
  const bookRepository = dataSource.getRepository(Book);

  const newBook = await bookRepository.save({
    title: req.body.title,
    fileUrl: req.file?.originalname,
    category: { id: req.body.category_id },
    created_by: { id: userId },
  });

  res.status(201).json({
    success: true,
    message: 'Book Created Successfully',
    data: newBook,
  });
};

export const getBooks: RequestHandler<{ id?: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  const { category_id } = req.query;
  const bookRepository = dataSource.getRepository(Book);

  if (id) {
    const book = await bookRepository.findOne({
      where: { id },
      relations: ['category', 'created_by'],
    });
    if (!book) {
      return next(new NotFound(ErrCodes.NOT_FOUND));
    }
    return res.status(201).json({
      success: true,
      message: 'Book retrieved successfully',
      data: book,
    });
  }

  const whereConditions: any = {};
  if (category_id) {
    whereConditions.category = { id: category_id as string };
  }

  const books = await bookRepository.find({
    where: whereConditions,
    relations: ['category', 'created_by'],
  });

  return res.status(201).json({
    success: true,
    message: category_id
      ? 'Books filtered by category retrieved successfully'
      : 'All books retrieved successfully',
    data: books,
  });
};

export const update: RequestHandler<
  { id: string },
  SuccessResponse,
  Partial<CreateBookBody>
> = async (req, res, next) => {
  const { id } = req.params;
  const { title, fileUrl, category_id } = req.body;

  const bookRepository = dataSource.getRepository(Book);

  await bookRepository.update(id, {
    ...(title && { title }),
    ...(fileUrl && { fileUrl }),
    ...(category_id && { category: { id: category_id } }),
    updated_at: new Date(),
  });

  const updatedBook = await bookRepository.findOne({
    where: { id },
    relations: ['category', 'created_by'],
  });

  return res.status(201).json({
    success: true,
    message: 'Book Updated Successfully',
    data: updatedBook,
  });
};

export const remove: RequestHandler<{ id: string }, SuccessResponse> = async (req, res, next) => {
  const bookRepository = dataSource.getRepository(Book);
  const result = await bookRepository.delete({ id: req.params.id });

  if (result.affected === 0) {
    return next(new NotFound(ErrCodes.NOT_FOUND));
  }

  return res.status(200).json({
    success: true,
    message: 'Book Deleted Successfully',
    data: null,
  });
};
