import { Router } from 'express';

import * as val from '../validators/permission.validator';
import * as controllers from '../controllers/permissions/permission.controller';
import { Guards } from '../guards';
import { PERMISSIONS } from '../types/permissions';

const router = Router();
router.use(Guards.isauthenticated);

router.get('/', Guards.isauthorized(PERMISSIONS.get_permissions), controllers.get);
router.get('/me', controllers.getLoggedUserPermissions);
router.patch(
  '/:permission_id',
  Guards.isauthorized(PERMISSIONS.update_permission),
  val.update,
  controllers.update,
);

export const permissionRoutes = router;
