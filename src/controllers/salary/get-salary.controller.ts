import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Salary } from '../../models/salary.model';
import { Errors } from '../../errors';
import { selectSalaryFields } from './get-salaries.controller';
import { userDataSubQuery } from '../../constants/query';

export const getSalaryById: RequestHandler<{ id: string }, SuccessResponse<Salary>> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;

  try {
    const salaryRepo = dataSource.getRepository(Salary);

    const salary = await   salaryRepo
    .createQueryBuilder('salary')
    .where('salary.provider_id = :providerId', { providerId:req.loggedUser.provider_id })
    .andWhere('salary.id = :id', { id })
    .select(selectSalaryFields)
    .addSelect(userDataSubQuery('salary.employee'), 'target_user')
    .addSelect(userDataSubQuery('salary.created_by_user'), 'created_by')
    .getRawOne();
    
    if (!salary) return next(new Errors.NotFound());

    res.json({ success: true, message: 'Salary fetched successfully', data: salary });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
