import { getPagination } from '../medicineCategories';
import { createProductHandler } from './create-product.controller';
import { deleteProductHandler } from './delete-product.controller';
import { getAllProductsHandler } from './get-all-products.controller';
import { getProductByIdHandler } from './get-one-product.controller';
import { updateProductHandler } from './update-product.controller';
import { updateQuantityHandler } from './updateQuantity.controller';

export {
  getAllProductsHandler,
  createProductHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
  updateQuantityHandler,
  getPagination
};
