import { RequestHandler, Router } from 'express';

import { Guards } from '../guards';
import { uploadMemoryStorage } from '../middlewares/upload-files.middleware';
import * as val from '../validators/article.validators';
import * as Controllers from '../controllers/article';
import { Middlewares } from '../middlewares';
import { PERMISSIONS } from '../types/permissions';
const router = Router();

router.use(Guards.isauthenticated);
router
  .route('/')
  .post(
    Guards.isauthorized(PERMISSIONS.create_article),
    uploadMemoryStorage().single('picture') as unknown as RequestHandler,
    val.createArticleValidators,
    Controllers.createArticle,
  )
  .get(
    Guards.isauthorized(PERMISSIONS.get_articles),
    val.getArticlesValidators,
    Middlewares.pagination,
    Controllers.getArticles as unknown as RequestHandler,
  );

router
  .route('/:id')
  .get(
    Guards.isauthorized(PERMISSIONS.get_article),
    val.checkIdValidator,
    Controllers.getOneArticle,
  )
  .patch(
    Guards.isauthorized(PERMISSIONS.update_article),
    uploadMemoryStorage().single('picture') as unknown as RequestHandler,
    val.updateArticleValidators,
    Controllers.updateArticle,
  )
  .delete(
    Guards.isauthorized(PERMISSIONS.remove_article),
    val.deleteArticleValidators,
    Controllers.deleteArticle,
  );

router.get(
  '/:id/comments',
  Guards.isauthorized(PERMISSIONS.get_comments),
  Middlewares.pagination,
  val.checkIdValidator,
  Controllers.getComments,
);

router
  .route('/comments')
  .post(
    Guards.isauthorized(PERMISSIONS.create_comment),
    val.createCommentValidators,
    Controllers.createComment,
  );

router
  .route('/comments/:id')
  .patch(
    Guards.isauthorized(PERMISSIONS.update_comment),
    val.updateCommentValidators,
    Controllers.updateComment,
  )
  .get(Guards.isauthorized(PERMISSIONS.get_comment), val.checkIdValidator, Controllers.getComment)
  .delete(
    Guards.isauthorized(PERMISSIONS.remove_comment),
    val.deleteCommentValidators,
    Controllers.deleteComment,
  );

router.post(
  '/:id/toggle-action',
  Guards.isauthorized(PERMISSIONS.article_action),
  val.checkIdValidator,
  Controllers.toggleArticleAction,
);
router.post(
  '/comments/:id/toggle-action',
  Guards.isauthorized(PERMISSIONS.comment_action),
  val.checkIdValidator,
  Controllers.toggleCommentAction,
);

export default router;
