import { createMedicineCategoryHandler } from './create-medicine-category.controller';
import { deleteMedicineCategoryHandler } from './delete-medicine-category.controller';
import {
  getAllMedicineCategoriesHandler,
  getPagination,
} from './get-all-medicine-categories.controller';
import { getMedicineCategoryByIdHandler } from './get-one-medicine-category.controller';
import { updateMedicineCategoryHandler } from './update-medicine-category.controller';

export {
  getAllMedicineCategoriesHandler,
  createMedicineCategoryHandler,
  getMedicineCategoryByIdHandler,
  updateMedicineCategoryHandler,
  deleteMedicineCategoryHandler,
  getPagination,
};
