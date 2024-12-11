import { Router } from 'express';

import * as Controllers from '../controllers/salary/index';
import * as val from '../validators/salary.validator';
import { Middlewares } from '../middlewares';
import { Guards } from '../guards';
import { PERMISSIONS } from '../types/permissions';
import { idValidator } from '../validators/reward.validators';

const router = Router();

// Apply authentication guard to all routes
router.use(Guards.isauthenticated);

// Salary history routes (place before `/:id` route)
router
  .route('/history')
  .post(Guards.isauthorized(PERMISSIONS.manage_salary_history), val.addSalaryToHistory, Controllers.addSalary)
  .get(Guards.isauthorized(PERMISSIONS.manage_salary_history),Middlewares.pagination, Controllers.getProviderSalaryHistory);

router.get('/history/logged-user',Guards.isauthorized(PERMISSIONS.read_logged_user_salary), Middlewares.pagination, Controllers.getUserSalaryHistory);
router.get('/history/logged-user/:id',Guards.isauthorized(PERMISSIONS.read_logged_user_salary), val.idValidator, Controllers.getUserHistoryOne);

router.patch('/history/receive/:id',Guards.isauthorized(PERMISSIONS.receive_salary), idValidator, Controllers.updateToReceived);

router
  .route('/history/:id')
  .get(Guards.isauthorized(PERMISSIONS.manage_salary_history),val.idValidator, Controllers.getProviderHistoryOne)
  .patch(Guards.isauthorized(PERMISSIONS.manage_salary_history),val.updateSalaryHistory, Controllers.updateSalaryHistory)
  .delete(Guards.isauthorized(PERMISSIONS.manage_salary_history),val.idValidator, Controllers.deleteSalaryHistory);

// Main salary routes
router
  .route('/')
  .post(
    Guards.isauthorized(PERMISSIONS.manage_salary),
    val.createSalaryValidator,
    Controllers.createSalary,
  )
  .get(
    Guards.isauthorized(PERMISSIONS.manage_salary),
    Middlewares.pagination,
    Controllers.getSalaries,
  );

router
  .route('/:id')
  .patch(
    Guards.isauthorized(PERMISSIONS.manage_salary),
    val.updateSalaryValidator,
    Controllers.updateSalary,
  )
  .get(Guards.isauthorized(PERMISSIONS.read_salary), val.idValidator, Controllers.getSalaryById)
  .delete(
    Guards.isauthorized(PERMISSIONS.manage_salary),
    val.idValidator,
    Controllers.deleteSalary,
  );

export const salaryRoutes = router;
