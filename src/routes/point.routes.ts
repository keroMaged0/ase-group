import { RequestHandler, Router } from 'express';

import * as pointController from '../controllers/points/index';
import * as pointValidator from '../validators/point.validator';
import { PERMISSIONS } from '../types/permissions';
import { Guards } from '../guards';
import { Middlewares } from '../middlewares';

const router = Router();

router.use(Guards.isauthenticated);
router
  .route('/')
  .get(
    Guards.isauthorized(PERMISSIONS.get_points),
    pointValidator.getPagination,
    Middlewares.pagination,
    pointController.getPagination as unknown as RequestHandler,
    pointController.getAllPointsHandler,
  )

  .post(
    Guards.isauthorized(PERMISSIONS.create_point),
    pointValidator.createPointValidator,
    pointController.createPointHandler,
  );

router
  .route('/:point_id')
  .get(
    Guards.isauthorized(PERMISSIONS.get_point),
    pointValidator.paramPointValidator,
    pointController.getPointByIdHandler,
  )

  .put(
    Guards.isauthorized(PERMISSIONS.update_point),
    pointValidator.updatePointValidator,
    pointController.updatePointHandler,
  )

  .delete(
    Guards.isauthorized(PERMISSIONS.remove_point),
    pointValidator.paramPointValidator,
    pointController.deletePointHandler,
  );

export const PointRoutes = router;
