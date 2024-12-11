import { RequestHandler, Router } from 'express';
import * as controller from '../controllers/punishments/punishment.controller';
import * as val from '../validators/punishment.validator';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { isauthorized } from '../guards/isauthorized.guard';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';
import { punishmentRequestsRoutes } from './punishment-request.routes';


const router = Router();

router.use(isauthenticated);

router
  .route('/')
  .post(
    isauthorized(PERMISSIONS.create_punishment),
    val.create,
    controller.create,
  )
  .get(
    isauthorized(PERMISSIONS.get_punishment),
    val.getPagination,
    Middlewares.pagination,
    controller.getPagination as unknown as RequestHandler,
    controller.get,
  );

  router.use('/requests', punishmentRequestsRoutes);

router
  .route('/:punishmentId')
  .get(
    isauthorized(PERMISSIONS.get_punishment),
    val.punishmentParam,
    controller.getOne,
  )
  .patch(
    isauthorized(PERMISSIONS.update_punishment),
    val.update,
    controller.update,
  )
  .delete(
    isauthorized(PERMISSIONS.remove_punishment),
    val.punishmentParam,
    controller.remove,
  );

export const punishmentsRoutes = router;
