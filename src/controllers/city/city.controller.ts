import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { BadRequest } from '../../errors/bad-request-error';
import { City } from '../../models/city.model';
import { ErrCodes } from '../../types/error-code';
import { SuccessResponse } from '../../types/responses';
import { Errors } from '../../errors';

export const create: RequestHandler<
  unknown,
  SuccessResponse,
  { country_id: string; title: string }
> = async (req, res, next) => {
  const { title, country_id } = req.body;
  const cityRepository = dataSource.getRepository(City);

  try {
    const newCity = await cityRepository.save({
      title,
      country_id: { id: country_id },
    });

    res.status(201).json({
      success: true,
      message: 'City Created Successfully',
      data: newCity,
    });
  } catch (error) {
    return next(new BadRequest(ErrCodes.BAD_REQUEST));
  }
};

export const getAll: RequestHandler<{ country_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const cityRepository = dataSource.getRepository(City);

  const city = await cityRepository.find({ where: { country_id: { id: req.params.country_id } } });

  return res.json({
    success: true,
    message: 'City fetched successfully',
    data: city,
  });
};

export const remove: RequestHandler<{ city_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const cityRepository = dataSource.getRepository(City);
  const cityToDelete = await cityRepository.delete({ id: req.params.city_id });
  if (cityToDelete.affected === 0) return next(new Errors.NotFound(ErrCodes.NOT_FOUND));

  return res.json({
    success: true,
    message: 'City Deleted Successfully',
    data: {},
  });
};
