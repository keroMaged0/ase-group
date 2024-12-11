import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { Task } from '../../models/task.model';
import { SuccessResponse } from '../../types/responses';
import { IjwtPayload } from '../../types/jwt-payload';

interface ICreateTaskBody {
  description: string;
  start_at: Date;
  end_at: Date;
  target_user: string;
}

export const createTask: RequestHandler<unknown, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const { description, start_at, end_at, target_user } = req.body as ICreateTaskBody;
  const userId = req.loggedUser.id;
  const providerId = req.loggedUser.provider_id;

  try {
    const taskRepo = dataSource.getRepository(Task);
    const task = taskRepo.create({
      description,
      start_at,
      end_at,
      target_user,
      provider_id: providerId,
      created_by: userId,
    });

    const savedTask = await taskRepo.save(task);

    res.json({
      success: true,
      message: 'Task created successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
