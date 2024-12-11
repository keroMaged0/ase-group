import { RequestHandler, Router } from 'express';
import * as controller from '../controllers/commissions/commission-request.controller';
import * as val from '../validators/commission-request.validator';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { isauthorized } from '../guards/isauthorized.guard';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';


const router = Router();

// Ensure all routes require authentication
router.use(isauthenticated);

router
  .route('/')
  .post(
    // isauthorized(PERMISSIONS.create_commission_request),
    val.create,
    controller.create,
  )
  .get(
    // isauthorized(PERMISSIONS.get_commission_requests),
    val.getPagination,
    Middlewares.pagination,
    controller.getPagination as unknown as RequestHandler,
    controller.get,
  );

router
  .route('/:id')
  .get(
    // isauthorized(PERMISSIONS.get_commission_request),
    val.commissionRequestParam,
    controller.getOne,
  )
  .patch(
    // isauthorized(PERMISSIONS.update_commission_request),
    val.update,
    controller.update,
  )
  .delete(
    // isauthorized(PERMISSIONS.remove_commission_request),
    val.commissionRequestParam,
    controller.remove,
  );

export const commissionRequestRoutes = router;
