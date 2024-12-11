import { Router } from 'express';
import * as controllers from '../controllers/book-category/book-category.controller';
import * as val from '../validators/book-category.validator';
import { Guards } from '../guards';

const router = Router();

router
  .route('/')
  .post(Guards.isauthenticated, Guards.isauthorized, val.create, controllers.create)
  .get(controllers.getCategories);

router
  .route('/:id')
  .put(Guards.isauthenticated, Guards.isauthorized, val.update, controllers.update)
  .delete(Guards.isauthenticated, Guards.isauthorized, controllers.remove);

export const bookCategoryRoutes = router;
