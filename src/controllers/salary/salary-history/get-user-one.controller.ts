import { RequestHandler } from 'express';
import { PaginationResponse, SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { SalaryHistory } from '../../../models/salary-history.model';
import { userDataSubQuery } from '../../../constants/query';
import { salariesHistorySelectFields } from './consts';
import { Errors } from '../../../errors';

export const getUserHistoryOne: RequestHandler<{ id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  try {
    const salary = await dataSource
      .getRepository(SalaryHistory)
      .createQueryBuilder('salary_history')
      .leftJoin('salary_history.salary', 'salary')
      .select(salariesHistorySelectFields)
      .addSelect(userDataSubQuery('salary.target_user'), 'target_user')
      .where('salary.target_user =:userId', { userId: req.loggedUser.id })
      .andWhere({ id })
      .getRawOne();

    if (!salary) return next(new Errors.NotFound());

    res.json({
      success: true,
      message: 'Salary fetched successfully',
      data: salary,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
