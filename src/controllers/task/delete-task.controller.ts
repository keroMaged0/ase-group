import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { Task } from '../../models/task.model';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { TASK_STATUS } from '../../types/task-status';

export const deleteTask: RequestHandler<{ id: string }, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;

  try {
    const taskRepo = dataSource.getRepository(Task);
    const task = await taskRepo
      .createQueryBuilder()
      .update()
      .set({ is_deleted: true })
      .where({id, status: TASK_STATUS.pending, provider_id: req.loggedUser.provider_id})
      .execute();

    if (!task || !task.affected) return next(new Errors.NotFound());

    res.json({ success: true, message: 'Task deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};
