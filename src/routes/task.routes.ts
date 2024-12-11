import { Router } from 'express';

import { Guards } from '../guards';
import * as val from '../validators/task.validator';
import * as Controllers from '../controllers/task';
import { Middlewares } from '../middlewares';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

router.use(Guards.isauthenticated);
router
  .route('/')
  .post(
    Guards.isauthorized(PERMISSIONS.create_task),
    val.createTaskValidator,
    Controllers.createTask,
  )
  .get(
    Guards.isauthorized(PERMISSIONS.get_tasks),
    Middlewares.pagination,
    Controllers.getProviderTasks,
  );

router.get(
  '/logged-user',
  Guards.isauthorized(PERMISSIONS.get_logged_user_tasks),
  Middlewares.pagination,
  Controllers.getLoggedUserTasks,
);

router
  .route('/:id')
  .patch(
    Guards.isauthorized(PERMISSIONS.update_task),
    val.updateTaskValidator,
    Controllers.updateTask,
  )
  .delete(Guards.isauthorized(PERMISSIONS.delete_task), val.idValidator, Controllers.deleteTask);

router.patch(
  '/:id/status',
  Guards.isauthorized(PERMISSIONS.update_task_status),
  val.updateStatusValidator,
  Controllers.updateTaskStatus,
);
export const taskRoutes = router;
