import { Errors } from './../../errors/index';
import { Country } from '../../models/country.model';
import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';

export const create: RequestHandler<unknown, SuccessResponse, { title: string }> = async (
  req,
  res,
  next,
) => {
  const { title } = req.body;

  const countryRepository = dataSource.getRepository(Country);
  const savedCountry = await countryRepository.save({ title });

  res.status(201).json({
    success: true,
    message: 'Country Created Successfully',
    data: savedCountry,
  });
};

export const getAll: RequestHandler<unknown, SuccessResponse> = async (req, res, next) => {
  const countryRepository = dataSource.getRepository(Country);
  const countries = await countryRepository.find();

  return res.json({
    success: true,
    message: 'Countries fetched successfully',
    data: countries,
  });
};

export const remove: RequestHandler<{ country_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const countryRepository = dataSource.getRepository(Country);
  const countryToDelete = await countryRepository.delete({ id: req.params.country_id });
  if (countryToDelete.affected === 0) return next(new Errors.NotFound(ErrCodes.NOT_FOUND));

  return res.json({
    success: true,
    message: 'Country Deleted Successfully',
    data: {},
  });
};
