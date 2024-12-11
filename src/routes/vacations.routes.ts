import { RequestHandler, Router } from 'express';
import * as controller from '../controllers/vacation/vacations.controller';
import * as val from '../validators/vacations.validator';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { isauthorized } from '../guards/isauthorized.guard';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';
import { vacationRequestsRoutes } from './vacation-requests.routes';

const router = Router();

router.use(isauthenticated);

router
  .route('/')
  .post(isauthorized(PERMISSIONS.create_vacation), val.create, controller.create)
  .get(
    isauthorized(PERMISSIONS.get_vacation),
    val.getPagination,
    Middlewares.pagination,
    controller.getPagination as unknown as RequestHandler,
    controller.get,
  );

router.use('/requests', vacationRequestsRoutes);

router
  .route('/:vacationId')
  .get(isauthorized(PERMISSIONS.get_vacation), val.vacationParam, controller.getOne)
  .patch(isauthorized(PERMISSIONS.update_vacation), val.update, controller.update)
  .delete(isauthorized(PERMISSIONS.remove_vacation), val.vacationParam, controller.remove);

export const vacationsRoutes = router;
