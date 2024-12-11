import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { BadRequest } from '../../errors/bad-request-error';
import { NotAllowed } from '../../errors/not-allowed-error';
import { City } from '../../models/city.model';
import { State } from '../../models/state.model';
import { UserAuth } from '../../models/user-auth.model';
import { ErrCodes } from '../../types/error-code';
import { SuccessResponse } from '../../types/responses';
import { Errors } from '../../errors';

export const create: RequestHandler<
  unknown,
  SuccessResponse,
  { title: string; city_id: string }
> = async (req, res, next) => {
  const stateRepository = dataSource.getRepository(State);
  try {
    const newState = await stateRepository.save({
      title: req.body.title,
      city_id: { id: req.body.city_id },
    });
    res.json({
      success: true,
      message: 'State Created Successfully',
      data: newState,
    });
  } catch (error) {
    return next(new Errors.BadRequest(ErrCodes.BAD_REQUEST));
  }
};

export const findAll: RequestHandler<{ city_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const stateRepository = dataSource.getRepository(State);

  const states = await stateRepository.find({ where: { city_id: { id: req.params.city_id } } });

  return res.json({
    success: true,
    message: 'All states fetched successfully',
    data: states,
  });
};

export const remove: RequestHandler<{ state_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const stateRepository = dataSource.getRepository(State);
  const stateToDelete = await stateRepository.delete({ id: req.params.state_id });
  if (stateToDelete.affected === 0) return next(new Errors.NotFound(ErrCodes.NOT_FOUND));

  return res.json({
    success: true,
    message: 'State Deleted Successfully',
    data: stateRepository,
  });
};
