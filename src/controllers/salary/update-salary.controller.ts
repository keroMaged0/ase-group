import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Salary } from '../../models/salary.model';
import { Errors } from '../../errors';

interface IUpdateSalaryDTO {
  amount: number;
  sales_ratio: number;
}

export const updateSalary: RequestHandler<
  { id: string },
  SuccessResponse,
  IUpdateSalaryDTO
> = async (req, res, next) => {
  const { id } = req.params;
  const { amount, sales_ratio } = req.body;

  try {
    const salaryRepo = dataSource.getRepository(Salary);
    const salary = await salaryRepo
      .createQueryBuilder()
      .update()
      .set({ amount, sales_ratio })
      .where({ id })
      .andWhere({ provider_id: req.loggedUser.provider_id })
      .execute();

    if (!salary || !salary.affected) return next(new Errors.NotFound());

    res.json({ success: true, message: 'Salary updated successfully', data: null });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
