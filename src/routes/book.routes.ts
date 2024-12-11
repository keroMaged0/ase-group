import { RequestHandler, Router } from 'express';
import * as bookController from '../controllers/book/book.controller';
import * as val from '../validators/book.validator';
import { uploadMemoryStorage } from '../middlewares/upload-files.middleware';
import { Guards } from '../guards';

const router = Router();

const uploadPdf: any = uploadMemoryStorage({
  fileType: ['application/pdf'],
  maxSize: 2 * 1024 * 1024,
});

router.post(
  '/',
  Guards.isauthenticated,
  Guards.isauthorized,
  uploadPdf.single('file') as unknown as RequestHandler,
  val.create,
  bookController.create,
);

router.get('/:id?', Guards.isauthenticated, bookController.getBooks);

router.patch(
  '/:id',
  Guards.isauthenticated,
  Guards.isauthorized,
  val.update,
  bookController.update,
);

router.delete('/:id', Guards.isauthenticated, Guards.isauthorized, bookController.remove);

export const bookRoutes = router;
