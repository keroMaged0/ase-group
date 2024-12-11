import { RequestHandler, Router } from 'express';

import * as categoryController from '../controllers/medicineCategories/index';
import * as categoryValidator from '../validators/medicine-category.validator';
import { uploadMemoryStorage } from '../middlewares/upload-files.middleware';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';
import { Guards } from '../guards';

const router = Router();

router.use(Guards.isauthenticated);
router
  .route('/')
  .get(
    Guards.isauthorized(PERMISSIONS.get_all_medicine_category),
    Middlewares.pagination,
    categoryController.getPagination as unknown as RequestHandler,
    categoryController.getAllMedicineCategoriesHandler,
  )
  .post(
    Guards.isauthorized(PERMISSIONS.create_medicine_category),
    uploadMemoryStorage().single('cover_image') as unknown as RequestHandler,
    categoryValidator.createMedicineCategoryValidator,
    categoryController.createMedicineCategoryHandler,
  );

router
  .route('/:medicine_category_id')
  .get(
    Guards.isauthorized(PERMISSIONS.get_one_medicine_category),
    categoryValidator.paramMedicineCategoryValidator,
    categoryController.getMedicineCategoryByIdHandler,
  )

  .put(
    Guards.isauthorized(PERMISSIONS.update_medicine_category),
    uploadMemoryStorage().single('cover_image') as unknown as RequestHandler,
    categoryValidator.updateMedicineCategoryValidator,
    categoryController.updateMedicineCategoryHandler,
  )

  .delete(
    Guards.isauthorized(PERMISSIONS.remove_medicine_category),
    categoryValidator.paramMedicineCategoryValidator,
    categoryController.deleteMedicineCategoryHandler,
  );

export const categoryRoutes = router;
