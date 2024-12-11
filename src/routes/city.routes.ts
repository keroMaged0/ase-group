import { Router } from 'express';
import { Guards } from '../guards';
import * as val from '../validators/city.validator';
import * as controllers from '../controllers/city/city.controller';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

router
  .route('/')
  .post(
    Guards.isauthenticated,
    Guards.isauthorized(PERMISSIONS.create_city),
    val.create,
    controllers.create,
  );

router.delete(
  '/:city_id',
  Guards.isauthenticated,
  Guards.isauthorized(PERMISSIONS.remove_city),
  val.cityParam,
  controllers.remove,
);

router.get('/:country_id?', val.countryParam, controllers.getAll);

export const cityRoutes = router;
