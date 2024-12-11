import { RequestHandler } from 'express';
import { PaginationResponse, SuccessResponse } from '../../types/responses';
import { Task } from '../../models/task.model';
import { dataSource } from '../../config/typeorm';
import { UserAuth, UserType } from '../../models/user-auth.model';
import { userDataSubQuery } from '../../constants/query';

export const taskSelectFields = [
  'task.id AS id',
  'task.status AS status',
  'task.start_at AS start_at',
  'task.end_at AS end_at',
  'task.is_deleted AS is_deleted',
  'task.provider_id AS provider_id',
  'task.rejection_reason AS rejection_reason',
  'task.created_at AS created_at',
  'task.updated_at AS updated_at',
];

interface IGetTasksQFilter {
  status?: string;
  start_at?: Date;
  end_at?: Date;
  created_at?: Date;
  target_user?: string;
}

export const getProviderTasks: RequestHandler<
  unknown,
  PaginationResponse<Task[]>,
  any,
  IGetTasksQFilter
> = async (req, res, next) => {
  const providerId = req.loggedUser.provider_id;
  const status = req.query.status;
  let { start_at, end_at, created_at } = req.query;
  start_at = start_at ? new Date(start_at) : undefined;
  end_at = end_at ? new Date(end_at) : undefined;
  created_at = created_at ? new Date(created_at) : undefined;
  const { page, limit, skip } = req.pagination;
  try {
    const taskRepo = dataSource.getRepository(Task);
    const query = taskRepo
      .createQueryBuilder('task')
      .select(taskSelectFields)
      .addSelect(userDataSubQuery('task.target_user'), 'target_user')
      .addSelect(userDataSubQuery('task.created_by'), 'created_by')
      .where('task.provider_id = :providerId', { providerId })
      .andWhere('task.is_deleted = false');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    
    if (start_at && end_at)
      query.andWhere('task.start_at >= :start_at AND task.end_at <= :end_at', { start_at, end_at });
    else if (start_at) {
      query.andWhere('task.start_at >= :start_at', { start_at });
    } else if (end_at) {
      query.andWhere('task.end_at <= :end_at', { end_at });
    }

    if (created_at) {
      query.andWhere('DATE(task.created_at) >= DATE(:created_at)', { created_at });
    }

    query.skip(skip).take(limit);

    const [tasks, totalCount] = await Promise.all([query.getRawMany(), query.getCount()]);
    res.json({
      success: true,
      message: 'Tasks fetched successfully',
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        resultCount: tasks.length,
      },
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};
