import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { ErrCodes } from '../../types/error-code';
import { dataSource } from '../../config/typeorm';
import { Point } from '../../models/point.model';
import { Errors } from '../../errors';

interface CreatePointRequestBody {
  product_id?: string;
  name?: string;
  description?: string;
  points?: number;
  amount?: number;
}

export const createPointHandler: RequestHandler<
  unknown,
  SuccessResponse,
  CreatePointRequestBody
> = async (req, res, next) => {
  const { product_id, description, name, points, amount } = req.body;
  const userId = req.loggedUser;

  try {
    const point = await dataSource.getRepository(Point).save({
      provider_id: { id: userId.provider_id },
      product_id: { id: product_id },
      created_by: { id: userId.id },
      description,
      name,
      points,
      amount,
    });

    return res.json({
      success: true,
      message: 'Point created successfully',
      data: point,
    });
  } catch (error) {
    console.log(error);
    return next(new Errors.BadRequest(ErrCodes.SAVE_POINT_FAILED));
  }
};
