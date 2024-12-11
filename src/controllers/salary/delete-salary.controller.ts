import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Salary } from '../../models/salary.model';
import { Errors } from '../../errors';

export const deleteSalary: RequestHandler<{ id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  const providerId = req.loggedUser.provider_id;
  try {
    const salaryRepo = dataSource.getRepository(Salary);

    const result = await salaryRepo
      .createQueryBuilder()
      .delete()
      .where({ id, provider_id:providerId })
      .execute();

    if (result.affected === 0) return next(new Errors.NotFound());

    res.json({ success: true, message: 'Salary deleted successfully', data: null });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
