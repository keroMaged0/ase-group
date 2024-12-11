import { RequestHandler } from 'express';
import { dataSource } from '../../../config/typeorm';
import { Salary } from '../../../models/salary.model';
import { Errors } from '../../../errors';
import { SalaryHistory } from '../../../models/salary-history.model';
import { SuccessResponse } from '../../../types/responses';

const addSalaryToHistory = async (
  userId: string,
  payLoad: Partial<SalaryHistory> = {},
) => {
  const salary = await dataSource.getRepository(Salary).findOne({ where: { target_user: userId } });
  if (!salary) throw new Errors.NotFound();
  payLoad.real_salary = payLoad.real_salary || salary.amount;
  const newSalaryHistory = await dataSource
    .getRepository(SalaryHistory)
    .save({ ...payLoad, salary_id: salary.id });
};

interface addSalaryDTO {
  target_user:string;
  real_salary: number;
  commissions: number;
}

export const addSalary: RequestHandler<{ userId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
//   const { userId } = req.params;
  const {target_user,  real_salary, commissions } = req.body as addSalaryDTO;
  try {
    await addSalaryToHistory(target_user, { real_salary, commissions });
    res.json({ success: true, message: 'Salary added to history successfully', data: {} });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
