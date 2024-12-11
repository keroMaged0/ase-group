import { RequestHandler } from 'express';
import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { SalaryHistory } from '../../../models/salary-history.model';
import { Errors } from '../../../errors';


export const updateToReceived: RequestHandler<{ id: string }, SuccessResponse> = async (
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
      .andWhere('salary.target_user = :userId', { userId: req.loggedUser.id })
      .andWhere({ is_received: false })
      .getOne();

    if (!salaryHistory) {
      return next(new Errors.NotFound());
    }

    await dataSource
      .getRepository(SalaryHistory)
      .update(id, { is_received: true, paid_at: new Date().toISOString() });

    return res.json({ success: true, message: 'Salary paid successfully', data: {} });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
