import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { Task } from '../../models/task.model';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { TASK_STATUS } from '../../types/task-status';

export const updateTask: RequestHandler<{ id: string }, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  const { description, start_at, end_at } = req.body;
  const providerId = req.loggedUser.provider_id;
  try {
    const taskRepo = dataSource.getRepository(Task);
    const task = await taskRepo
      .createQueryBuilder()
      .update()
      .set({ description, start_at, end_at })
      .where('id = :id', { id })
      .andWhere('is_deleted = false')
      .andWhere('status = :status', { status: TASK_STATUS.pending })
      .andWhere('provider_id = :providerId', { providerId })
      .execute();

    if (!task || !task.affected) return next(new Errors.NotFound());

    res.json({ success: true, message: 'Task updated successfully', data: null });
  } catch (error) {
    next(error);
  }
};
