import { RequestHandler } from 'express';
import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { SalaryHistory } from '../../../models/salary-history.model';
import { Errors } from '../../../errors';

export const deleteSalaryHistory: RequestHandler<{ id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;

  try {
    const salaryHistory = await dataSource
      .getRepository(SalaryHistory)
      .createQueryBuilder('salary_history')
      .leftJoin('salary_history.salary', 'salary')
      .where('salary_history.id = :id', { id })
      .andWhere('salary.provider_id = :providerId', { providerId: req.loggedUser.provider_id })
      .andWhere({ is_received: false })
      .getOne();

    if (!salaryHistory) {
      return next(new Errors.NotFound());
    }

    await dataSource.getRepository(SalaryHistory).delete(id);

    return res.json({ success: true, message: 'Salary history updated successfully', data: {} });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
