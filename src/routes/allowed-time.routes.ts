import { Router } from 'express';
import { Guards } from '../guards';
import * as val from '../validators/allowd-time.validator';
import * as controllers from '../controllers/allowedVisitTime/allowed-visit-time.controller';
import { PERMISSIONS } from '../types/permissions';

const router = Router();
router.use(Guards.isauthenticated);
router.patch(
  '/update/:id',
  Guards.isauthorized(PERMISSIONS.update_allowed_visit_time),
  val.update,
  controllers.update,
);

router.get(
  '/',
  Guards.isauthorized,
  Guards.isauthorized(PERMISSIONS.get_allowed_visit_time),
  controllers.get,
);

export const allowedVisitTimeRoutes = router;
