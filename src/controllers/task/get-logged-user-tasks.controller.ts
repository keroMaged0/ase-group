import { RequestHandler } from 'express';
import { PaginationResponse, SuccessResponse } from '../../types/responses';
import { Task } from '../../models/task.model';
import { dataSource } from '../../config/typeorm';
import { taskSelectFields } from './get-provider-tasks.controller';
import { userDataSubQuery } from '../../constants/query';

interface IGetTasksQFilter {
  status?: string;
  start_at?: Date;
  end_at?: Date;
  created_at?: Date;
  target_user?: string;
}

export const getLoggedUserTasks: RequestHandler<
  unknown,
  PaginationResponse<Task[]>,
  any,
  IGetTasksQFilter
> = async (req, res, next) => {
  const userId = req.loggedUser.id;
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
      .where('task.target_user = :userId', { userId })
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
