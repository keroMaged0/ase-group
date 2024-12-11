import { RequestHandler } from 'express';

import { DoctorSpecialty } from '../../models/doctor-specialty.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { BadRequest } from '../../errors/bad-request-error';

interface CreateSpecialty {
  title: string;
  description: string;
  parent_id?: string;
}

export const createDoctorSpecialtyHandler: RequestHandler<
  unknown,
  SuccessResponse,
  CreateSpecialty
> = async (req, res, next) => {
  try {
    const doctorSpecialty = await dataSource.getRepository(DoctorSpecialty).save({
      ...req.body,
      parent_id: req.body.parent_id ? { id: req.body.parent_id } : undefined,
    });

    return res.json({
      success: true,
      message: 'Specialty created successfully',
      data: doctorSpecialty,
    });
  } catch (error) {
    return next(new BadRequest());
  }
};
