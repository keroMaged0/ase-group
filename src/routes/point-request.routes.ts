import { RequestHandler, Router } from 'express';

import * as pointReqController from '../controllers/points/points-requests/index';
import * as pointReqValidator from '../validators/point-request.validator';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';
import { Guards } from '../guards';

const router = Router();

router.use(Guards.isauthenticated);
router
  .route('/')
  .get(
    Guards.isauthorized(PERMISSIONS.get_point_requests),
    pointReqValidator.getPagination,
    Middlewares.pagination,
    pointReqController.getPagination as unknown as RequestHandler,
    pointReqController.getAllPointReqHandler,
  )
  .post(
    Guards.isauthorized(PERMISSIONS.create_point_request),
    pointReqValidator.createPointReqValidator,
    pointReqController.createPointReqHandler,
  );

router.post(
  '/withdraw',
  Guards.isauthorized(PERMISSIONS.create_withdraw_point_request),
  pointReqValidator.createPointReqValidator,
  pointReqController.createWithdrawPointReqHandler,
);

router
  .route('/:point_request_id')
  .get(
    Guards.isauthorized(PERMISSIONS.get_point_requests),
    pointReqValidator.paramPointReqValidator,
    pointReqController.getOnePointReqHandler,
  )

  .put(
    Guards.isauthorized(PERMISSIONS.update_point_request),
    pointReqValidator.updatePointReqValidator,
    pointReqController.updatePointReqHandler,
  )

  .delete(
    Guards.isauthorized(PERMISSIONS.remove_point_request),
    pointReqValidator.paramPointReqValidator,
    pointReqController.deletePointHandler,
  );

// router.get(
//   '/user/provider',
//   // Guards.isauthorized(PERMISSIONS.get_provider_point_requests),
//   pointReqController.getProviderPointReqHandler,
// );

export const pointsRequestsRoutes = router;
