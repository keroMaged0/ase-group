import { RequestHandler } from 'express';
import { PaginationResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Salary } from '../../models/salary.model';
import { userDataSubQuery } from '../../constants/query';

export const selectSalaryFields = [
  'salary.id AS id ',
  'salary.amount AS amount',
  'salary.provider_id AS provider_id',
  'salary.created_at AS created_at',
  'salary.updated_at AS updated_at',
];

export const getSalaries: RequestHandler<unknown, PaginationResponse<Salary[]>> = async (
  req,
  res,
  next,
) => {
  const { page, limit, skip } = req.pagination;
  const providerId = req.loggedUser.provider_id;
  try {
    const salaryRepo = dataSource.getRepository(Salary);

    const salariesQuery = salaryRepo
      .createQueryBuilder('salary')
      .where('salary.provider_id = :providerId', { providerId })
      .select(selectSalaryFields)
      .addSelect(userDataSubQuery('salary.employee'), 'target_user')
      .addSelect(userDataSubQuery('salary.created_by_user'), 'created_by')

    const [salaries, totalCount] = await Promise.all([
      salariesQuery.offset(skip).limit(limit).getRawMany(),
      salariesQuery.getCount(),
    ]);

    res.json({
      success: true,
      message: 'Salaries fetched successfully',
      data: salaries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        resultCount: salaries.length,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
