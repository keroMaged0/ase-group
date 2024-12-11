import { Router } from 'express';
import * as controller from '../controllers/punishments/punishment-requests';
import * as val from '../validators/punishment-request.validator';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { isauthorized } from '../guards/isauthorized.guard';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';

const router = Router();

router.use(isauthenticated);

router.get(
  '/',
  isauthorized(PERMISSIONS.get_punishment_request),
  val.get,
  Middlewares.pagination,
  controller.getPagination,
  controller.get,
);

router.post(
  '/give',
  isauthorized(PERMISSIONS.give_punishment_request),
  val.give,
  controller.givePunishmentHandler,
);

router
  .route('/:punishmentRequestId')
  .get(
    isauthorized(PERMISSIONS.get_punishment_request),
    val.punishmentRequestParam,
    controller.getOnePunishmentRequestHandler,
  )
  .delete(
    isauthorized(PERMISSIONS.remove_punishment_request),
    val.punishmentRequestParam,
    controller.removePunishmentRequestHandler,
  );

export const punishmentRequestsRoutes = router;
