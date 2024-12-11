import { RequestHandler, Router } from 'express';
import * as controllers from '../controllers/auth';
import * as val from '../validators/auth.validator';
import { Guards } from '../guards';
import { PERMISSIONS } from '../types/permissions';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { Middlewares } from '../middlewares';
const router = Router();

router.post('/signin', val.signin, controllers.signinHandler);
router.post('/signup', val.signup, controllers.signupHandler);
router.post('/refresh-token', controllers.refreshUserToken);

router
  .route('/change-password')
  .patch(
    Guards.isauthenticated,
    Guards.isauthorized(PERMISSIONS.change_password),
    val.changePassword,
    controllers.changePasswordHandler,
  );

router
  .route('/forget-password')
  .post(val.askForgetPassword, controllers.askForgetPasswordHandler)
  .patch(val.updateForgettenPassword, controllers.updateForgetenPasswordHandler);

router
  .route('/update-email')
  .patch(
    Guards.isauthenticated,
    Guards.isauthorized(PERMISSIONS.update_email),
    val.updateEmailValidator,
    controllers.askChangeEmailHandler,
  );

router.post(
  '/verification-code/resend',
  val.resendVerificationCode,
  controllers.resendVerificationCode,
);
router.post('/verification-code/verify', val.verifyValidator, controllers.verifyHandler);

router
  .route('/profile')
  .all(isauthenticated)
  .get(controllers.getProfileHandler)
  .patch(
    Middlewares.uploadMemoryStorage().fields([
      { name: 'profile_image', maxCount: 1 },
      { name: 'license_image', maxCount: 1 },
    ]) as unknown as RequestHandler,
    val.profile,
    controllers.updateProfileHandler,
  );

router.get(
  '/users',
  isauthenticated,
  Guards.isauthorized(PERMISSIONS.find_users),
  val.findUsers,
  Middlewares.pagination,
  controllers.findUsersPagination,
  controllers.findUsers,
);

router.get('/users/:user_id', isauthenticated, val.userParam, controllers.findUser);

export const authRoutes = router;
