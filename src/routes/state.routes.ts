import { Router } from 'express';
import { Guards } from '../guards';
import * as controller from '../controllers/state/state.controller';
import * as val from '../validators/state.validator';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

router.post(
  '/',
  Guards.isauthenticated,
  Guards.isauthorized(PERMISSIONS.create_state),
  val.create,
  controller.create,
);

router
  .route('/:city_id')
  .get(controller.findAll)
  .delete(
    Guards.isauthenticated,
    Guards.isauthorized(PERMISSIONS.remove_state),
    val.cityParam,
    controller.remove,
  );

export const stateRoutes = router;
