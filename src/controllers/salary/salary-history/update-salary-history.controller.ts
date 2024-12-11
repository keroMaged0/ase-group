import { RequestHandler } from 'express';
import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { SalaryHistory } from '../../../models/salary-history.model';
import { Errors } from '../../../errors';

interface updateSalaryHistoryDTO {
  real_salary: number;
  commissions: number;
}

export const updateSalaryHistory: RequestHandler<{ id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  const { real_salary, commissions } = req.body as updateSalaryHistoryDTO;

  try {
    const salaryHistory = await dataSource
      .getRepository(SalaryHistory)
      .createQueryBuilder('salary_history')
      .leftJoin('salary_history.salary', 'salary')
      .where('salary_history.id = :id', { id })
      .andWhere('salary.provider_id = :providerId', { providerId: req.loggedUser.provider_id })
      .andWhere({is_received:false})
      .getOne();

    if (!salaryHistory) {
      return next(new Errors.NotFound());
    }

    await dataSource
      .getRepository(SalaryHistory)
      .update(id, { real_salary, commissions });

    return res.json({ success: true, message: 'Salary history updated successfully', data: {} });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
