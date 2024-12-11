import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { UserAuth } from '../../models/user-auth.model';
import { Errors } from '../../errors';
import { Salary } from '../../models/salary.model';

interface ICreateSalaryDTO {
  amount: number;
  sales_ratio: number;
  target_user: string;
}

export const createSalary: RequestHandler<unknown, SuccessResponse> = async (req, res, next) => {
  const { amount, sales_ratio, target_user } = req.body as ICreateSalaryDTO;
  try {
    const employee = await dataSource.getRepository(UserAuth).findOneBy({ id: target_user });
    if (!employee) return next(new Errors.NotFound());

    const salaryRepo = dataSource.getRepository(Salary);
    let newSalary = salaryRepo.create({
      amount,
      target_user,
      sales_ratio,
      provider_id: req.loggedUser.provider_id,
      created_by: req.loggedUser.id,
    });

    newSalary = await salaryRepo.save(newSalary);

    res.json({ success: true, message: 'salary created successfully', data: newSalary });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
