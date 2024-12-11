import { Router } from 'express';
import * as controllers from '../controllers/country/country.controller';
import * as val from '../validators/country.validator';
import { Guards } from '../guards';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

router
  .route('/')
  .post(
    Guards.isauthenticated,
    Guards.isauthorized(PERMISSIONS.create_country),
    val.create,
    controllers.create,
  )
  .get(controllers.getAll);

router.delete(
  '/:country_id',
  Guards.isauthenticated,
  Guards.isauthorized(PERMISSIONS.remove_country),
  val.remove,
  controllers.remove,
);

export const countryRoutes = router;
