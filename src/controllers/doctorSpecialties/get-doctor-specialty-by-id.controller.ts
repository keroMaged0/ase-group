import { RequestHandler } from 'express';

import { DoctorSpecialty } from '../../models/doctor-specialty.model';
import { SuccessResponse } from '../../types/responses';
import { ErrCodes } from '../../types/error-code';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';

export const getDoctorSpecialtyByIdHandler: RequestHandler<
  { specialty_id: string },
  SuccessResponse
> = async (req, res, next) => {
  const { specialty_id } = req.params;

  const specialty = await dataSource.getRepository(DoctorSpecialty).findOne({
    where: { id: specialty_id },
    relations: ['parent_id'],
  });
  if (!specialty) return next(new Errors.NotFound(ErrCodes.SPECIALTY_NOT_FOUND));

  return res.json({
    success: true,
    message: 'Specialty fetched successfully',
    data: specialty,
  });
};
