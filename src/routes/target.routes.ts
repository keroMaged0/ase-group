import { RequestHandler, Router } from 'express';

import * as targetController from '../controllers/targets/index';
import * as targetValidator from '../validators/target.validator';
import { Guards } from '../guards';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';

const router = Router();

router.use(Guards.isauthenticated);
router
  .route('/')
  .get(
    Guards.isauthorized(PERMISSIONS.get_all_target),
    targetValidator.getPagination,
    Middlewares.pagination,
    targetController.getPagination as unknown as RequestHandler,
    targetController.getAllTargetsHandler,
  )

  .post(
    Guards.isauthorized(PERMISSIONS.create_target),
    targetValidator.createTargetValidator,
    targetController.createTargetHandler,
  );

router
  .route('/:target_id')
  .get(
    Guards.isauthorized(PERMISSIONS.get_one_target),
    targetValidator.paramTargetValidator,
    targetController.getTargetByIdHandler,
  )

  .put(
    Guards.isauthorized(PERMISSIONS.update_target),
    targetValidator.updateTargetValidator,
    targetController.updateTargetHandler,
  )

  .delete(
    Guards.isauthorized(PERMISSIONS.remove_target),
    targetValidator.paramTargetValidator,
    targetController.deleteTargetHandler,
  );

export const targetRoutes = router;
