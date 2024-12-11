import { RequestHandler, Router } from 'express';
import * as controller from '../controllers/commissions/commissions.controller';
import * as val from '../validators/commissions.validator';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { isauthorized } from '../guards/isauthorized.guard';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';

const router = Router();

router.use(isauthenticated);

router
  .route('/')
  .post(
    // isauthorized(PERMISSIONS.create_commission),
    val.create, 
    controller.create, 
  )
  .get(
    // isauthorized(PERMISSIONS.get_commission),
    val.getPagination, 
    Middlewares.pagination, 
    controller.getPagination as unknown as RequestHandler, 
    controller.get, 
  );

router
  .route('/:commissionId')
  .get(
    // isauthorized(PERMISSIONS.get_commission),
    val.commissionParam, 
    controller.getOne, 
  )
  .patch(
    // isauthorized(PERMISSIONS.update_commission),
    val.update, 
    controller.update, 
  )
  .delete(
    // isauthorized(PERMISSIONS.remove_commission),
    val.commissionParam, 
    controller.remove, 
  );

export const commissionsRoutes = router;
