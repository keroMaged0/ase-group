import { authentication } from './authentication.middlewares';
import { errorHandler } from './error-handling.middlewares';
import { language } from './language.middlewares';
import { pagination } from './pagination.middleware';
import { routeNotFound } from './route-not-found.middlewares';
import { validator } from './validator.middleware';
import { uploadMemoryStorage } from './upload-files.middleware';
export const Middlewares = {
  authentication,
  routeNotFound,
  errorHandler,
  pagination,
  language,
  validator,
  uploadMemoryStorage,
};
