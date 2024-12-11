import { Router } from 'express';
import * as controller from '../controllers/vacation/vacation-requests';
import * as val from '../validators/vacation-request.validator';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { isauthorized } from '../guards/isauthorized.guard';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';

const router = Router();

router.use(isauthenticated);

router.get(
  '/',
  isauthorized(PERMISSIONS.get_vacation_request),
  val.get,
  Middlewares.pagination,
  controller.getPagination,
  controller.get,
);

router.get(
  '/me',
  val.get,
  Middlewares.pagination,
  controller.getPagination,
  controller.getRelatedToLoggedUser,
);

router.get(
  '/me/:vacationRequestId',
  val.vacationRequestParam,
  controller.getOneVacationRequestHandler,
);

router.post(
  '/gift',
  isauthorized(PERMISSIONS.gift_vacation_request),
  val.gift,
  controller.giftVacationHandler,
);

router.post(
  '/request',
  isauthorized(PERMISSIONS.request_vacation_request),
  val.request,
  controller.requestVacationHandler,
);

router.post(
  '/retreive',
  isauthorized(PERMISSIONS.retreive_rest_vacation_days),
  val.retreive,
  controller.retreiveRestVacationDays,
);

router
  .route('/:vacationRequestId')
  .get(
    isauthorized(PERMISSIONS.get_vacation_request),
    val.vacationRequestParam,
    controller.getOneVacationRequestHandler,
  )
  .patch(
    isauthorized(PERMISSIONS.update_vacation_request),
    val.update,
    controller.updateVacationRequestHandler,
  )
  .delete(
    isauthorized(PERMISSIONS.remove_vacation_request),
    val.vacationRequestParam,
    controller.removeVacationRequestHandler,
  );

export const vacationRequestsRoutes = router;
