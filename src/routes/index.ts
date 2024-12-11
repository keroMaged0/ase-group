import { Router } from 'express';

import articleRoutes from './article.routes';
import { roleRoutes } from './role.routes';
import { authRoutes } from './auth.routes';
import { vacationsRoutes } from './vacations.routes';

import { doctorSpecialtiesRoutes } from './doctor-specialties.routes';
import { attachmentsRoutes } from './attachments.routes';
import { countryRoutes } from './country.routes';
import { cityRoutes } from './city.routes';
import { stateRoutes } from './state.routes';
import { allowedVisitTimeRoutes } from './allowed-time.routes';
import { permissionRoutes } from './permission.routes';
import { punishmentsRoutes } from './punishment.routes';
import { rewardRoutes } from './reward.routes';
import { bookCategoryRoutes } from './book-category.routes';
import { salaryRoutes } from './salary.routes';
import { commissionsRoutes } from './commissions.routes';
import { commissionRequestRoutes } from './commission-request.routes';
import { taskRoutes } from './task.routes';
import { targetRoutes } from './target.routes';
import { PointRoutes } from './point.routes';
import { categoryRoutes } from './medicine-category.routes';
import { productRoutes } from './product.routes';
import { pointsRequestsRoutes } from './point-request.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/vacations', vacationsRoutes);
router.use('/attachments', attachmentsRoutes);
router.use('/country', countryRoutes);
router.use('/city', cityRoutes);
router.use('/state', stateRoutes);
router.use('/allowed-visit-time', allowedVisitTimeRoutes);
router.use('/permissions', permissionRoutes);
router.use('/punishment', punishmentsRoutes);
router.use('/book-category', bookCategoryRoutes);
router.use('/commissions', commissionsRoutes);
router.use('/commission-request', commissionRequestRoutes);
router.use('/punishments', punishmentsRoutes);
router.use('/articles', articleRoutes);
router.use('/doctor-specialties', doctorSpecialtiesRoutes);
router.use('/articles', articleRoutes);
router.use('/rewards', rewardRoutes);
router.use('/salaries', salaryRoutes);
router.use('/tasks', taskRoutes);
router.use('/targets', targetRoutes);
router.use('/points', PointRoutes);
router.use('/points-request', pointsRequestsRoutes);
router.use('/medicine-categories', categoryRoutes);
router.use('/products', productRoutes);

export const apiRoutes = router;
