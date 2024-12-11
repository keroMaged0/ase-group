import { RequestHandler } from 'express';

import { DoctorSpecialty } from '../../models/doctor-specialty.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';

export const deleteDoctorSpecialtyHandler: RequestHandler<
  { specialty_id: string },
  SuccessResponse
> = async (req, res, next) => {
  const softDeleteResult = await dataSource
    .getRepository(DoctorSpecialty)
    .update({ id: req.params.specialty_id }, { isDeleted: true });

  if (softDeleteResult.affected === 0) {
    return next(new Errors.NotFound(ErrCodes.SPECIALTY_NOT_FOUND));
  }

  return res.json({
    success: true,
    message: 'Specialty deleted successfully',
    data: {},
  });
};
