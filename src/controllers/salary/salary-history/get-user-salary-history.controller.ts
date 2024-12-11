import { RequestHandler } from 'express';
import { PaginationResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { SalaryHistory } from '../../../models/salary-history.model';
import { userDataSubQuery } from '../../../constants/query';
import { salariesHistorySelectFields } from './consts';

export const getUserSalaryHistory: RequestHandler<unknown, PaginationResponse> = async (
  req,
  res,
  next,
) => {
  const { page, skip, limit } = req.pagination;
  try {
    const baseQuery = dataSource
      .getRepository(SalaryHistory)
      .createQueryBuilder('salary_history')
      .leftJoin('salary_history.salary', 'salary')
      .where('salary.target_user =:userId', { userId: req.loggedUser.id });

    const salariesQuery = baseQuery
      .select(salariesHistorySelectFields)
      .addSelect(userDataSubQuery('salary.target_user'), 'target_user')
      .offset(skip)
      .limit(limit)
      .orderBy({created_at:'DESC'})
      .getRawMany();

    const [salaries, totalCount] = await Promise.all([salariesQuery, baseQuery.getCount()]);
    res.json({
      success: true,
      message: 'Salary history fetched successfully',
      pagination: {
        currentPage: page,
        resultCount: salaries.length,
        totalPages: Math.ceil(totalCount / limit),
      },
      data: salaries,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
