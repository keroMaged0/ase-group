import { RequestHandler } from 'express';

import { DoctorSpecialty } from '../../models/doctor-specialty.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';

export const getAllDoctorsSpecialtiesHandler: RequestHandler<unknown, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const specialties = await dataSource
    .getRepository(DoctorSpecialty)
    .find({ where: { isDeleted: false } });

  return res.json({
    success: true,
    message: 'All Specialty fetched successfully',
    data: specialties,
  });
};
