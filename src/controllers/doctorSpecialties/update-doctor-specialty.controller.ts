import { RequestHandler } from 'express';

import { DoctorSpecialty } from '../../models/doctor-specialty.model';
import { SuccessResponse } from '../../types/responses';
import { ErrCodes } from '../../types/error-code';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';

export const updateDoctorSpecialtyHandler: RequestHandler<
  { specialty_id: string },
  SuccessResponse,
  { title: string; description: string }
> = async (req, res, next) => {
  const specialty = await dataSource
    .getRepository(DoctorSpecialty)
    .update({ id: req.params.specialty_id }, { ...req.body });
  if (specialty.affected === 0) return next(new Errors.NotFound(ErrCodes.SPECIALTY_NOT_FOUND));

  return res.json({
    success: true,
    message: 'Specialty updated successfully',
    data: {},
  });
};
