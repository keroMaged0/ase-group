import { Router } from 'express';

import * as Controllers from '../controllers/reward';
import { Guards } from '../guards';
import { PERMISSIONS } from '../types/permissions';
import * as val from '../validators/reward.validators';
import { Middlewares } from '../middlewares';

const router = Router();

router.use(Guards.isauthenticated);

router
  .route('/')
  .post(
    Guards.isauthorized(PERMISSIONS.create_reward),
    val.createRewardValidator,
    Controllers.createReward,
  )
  .get(Middlewares.pagination, Controllers.getRewards);

router.delete('/:id', val.idValidator, Controllers.deleteReward);

router.get('/user-rewards', Middlewares.pagination, Controllers.getGivenRewards);
router.get('/user-reward/:id', val.idValidator, Controllers.getGivenReward);

router.post(
  '/give',
  Guards.isauthorized(PERMISSIONS.give_reward),
  val.giveRewardValidator,
  Controllers.giveReward,
);

export const rewardRoutes = router;
