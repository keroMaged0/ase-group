import { RequestHandler, Router } from 'express';

import { uploadMemoryStorage } from '../middlewares/upload-files.middleware';
import * as productController from '../controllers/products/index';
import * as productValidator from '../validators/product.validator';
import { PERMISSIONS } from '../types/permissions';
import { Middlewares } from '../middlewares';
import { Guards } from '../guards';

const router = Router();

router.use(Guards.isauthenticated);
router
  .route('/')
  .get(
    Guards.isauthorized(PERMISSIONS.get_all_product),
    Middlewares.pagination,
    productController.getPagination as unknown as RequestHandler,
    productController.getAllProductsHandler,
  )

  .post(
    Guards.isauthorized(PERMISSIONS.create_product),
    uploadMemoryStorage().single('cover_image') as unknown as RequestHandler,
    productValidator.createProductValidator,
    productController.createProductHandler,
  );

router
  .route('/:product_id')
  .get(
    Guards.isauthorized(PERMISSIONS.get_one_product),
    productValidator.paramProductValidator,
    productController.getProductByIdHandler,
  )

  .put(
    Guards.isauthorized(PERMISSIONS.update_product),
    uploadMemoryStorage().single('cover_image') as unknown as RequestHandler,
    productValidator.updateProductValidator,
    productController.updateProductHandler,
  )

  .patch(
    Guards.isauthorized(PERMISSIONS.update_quantity),
    productValidator.updateQuantityValidator,
    productController.updateQuantityHandler,
  )

  .delete(
    Guards.isauthorized(PERMISSIONS.remove_product),
    productValidator.paramProductValidator,
    productController.deleteProductHandler,
  );

export const productRoutes = router;
