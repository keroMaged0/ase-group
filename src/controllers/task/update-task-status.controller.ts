import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { Task } from '../../models/task.model';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { TASK_STATUS } from '../../types/task-status';

export const updateTaskStatus: RequestHandler<{ id: string }, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  const { action, rejection_reason } = req.body;
  const userId = req.loggedUser.id;

  try {
    const taskRepo = dataSource.getRepository(Task);

    // Initialize the query builder for update
    const query = taskRepo
      .createQueryBuilder()
      .update(Task)
      .where('id = :id', { id })
      .andWhere('target_user = :userId', { userId });

    // Apply conditions based on the action
    if (action === 'accept') {
      query
        .set({ status: TASK_STATUS.scheduled })
        .andWhere('status = :pendingStatus', { pendingStatus: TASK_STATUS.pending });
    } else if (action === 'reject') {
      query
        .set({ status: TASK_STATUS.rejected, rejection_reason })
        .andWhere('status = :pendingStatus', { pendingStatus: TASK_STATUS.pending });
    } else if (action === 'complete') {
      query
        .set({ status: TASK_STATUS.done })
        .andWhere('status = :scheduledStatus', { scheduledStatus: TASK_STATUS.scheduled });
    } else {
      return next(new Errors.BadRequest());
    }

    // Execute the update
    const result = await query.execute();

    // Check if any rows were affected
    if (result.affected === 0) {
      return next(new Errors.NotFound());
    }

    res.json({ success: true, message: 'Task status updated successfully', data: null });
  } catch (error) {
    next(error);
  }
};
