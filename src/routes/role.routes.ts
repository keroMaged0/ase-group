import { Router } from 'express';

import * as roleValidator from '../validators/role.validator';
import * as roleController from '../controllers/role/index';
import { Guards } from '../guards';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

router.use(Guards.isauthenticated);
router
  .route('/')
  .post(
    Guards.isauthorized(PERMISSIONS.create_role),
    roleValidator.createRoleValidator,
    roleController.createRoleHandler,
  )
  .get(Guards.isauthorized(PERMISSIONS.get_role), roleController.getAllRolesHandler);

router
  .route('/:role_id')
  .get(
    Guards.isauthorized(PERMISSIONS.get_role),
    roleValidator.paramRoleValidator,
    roleController.getRoleByIdHandler,
  )
  .patch(
    Guards.isauthorized(PERMISSIONS.update_role),
    roleValidator.updateRoleValidator,
    roleController.updateRoleHandler,
  )
  .delete(
    Guards.isauthorized(PERMISSIONS.remove_role),
    roleValidator.paramRoleValidator,
    roleController.deleteRoleHandler,
  );

export const roleRoutes = router;
