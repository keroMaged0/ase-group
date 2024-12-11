import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { Errors } from '../../errors';
import { ErrCodes } from '../../types/error-code';
import { dataSource } from '../../config/typeorm';
import { Article } from '../../models/article.model';
import { ArticleSpecialization } from '../../models/article-specialization.model';
import { FOLDERS } from '../../types/folders';
import { awsS3 } from '../../config/s3';

interface IUpdateTask {
  title: string;
  description: string;
  specializations: string[];
}

export const updateArticle: RequestHandler<{ id: string }, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const articleId = req.params.id;
  const { title, description, specializations }: IUpdateTask = req.body;
  let picture = '';
  const userId = req.loggedUser.id;
  try {
    const pictureFile: Express.Multer.File | undefined = req.file;
    if (pictureFile) {
      picture = FOLDERS.article + '/' + pictureFile.filename;
      await awsS3.saveBucketFiles(FOLDERS.article, pictureFile);
    }
    const articleRepo = dataSource.getRepository(Article);
    const oldArticle = await articleRepo.findOne({
      where: { id: articleId, created_by: { id: userId } },
    });
    if(!oldArticle) return next(new Errors.NotFound())
    if(oldArticle?.picture){
      awsS3.removeBucketFiles(oldArticle.picture);
    }
    const article = await articleRepo
      .createQueryBuilder()
      .update(Article)
      .set({ title, description, picture })
      .where({ id: articleId, created_by: userId })
      .execute();

    if (!article || article.affected === 0) {
      return next(new Errors.NotFound(ErrCodes.NOT_FOUND));
    }

    if (specializations?.length > 0) {
      const articleSpecializationRepo = dataSource.getRepository(ArticleSpecialization);

      await articleSpecializationRepo
        .createQueryBuilder()
        .delete()
        .where({ article_id: articleId })
        .execute();

      const newArticleSpecializations = specializations.map((specialization) => {
        return articleSpecializationRepo.create({
          article_id: articleId,
          specialization_id: specialization,
        });
      });

      await articleSpecializationRepo.save(newArticleSpecializations);
    }

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
