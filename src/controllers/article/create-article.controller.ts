/* eslint-disable import/no-unused-modules */
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Article } from '../../models/article.model';
import { ArticleSpecialization } from '../../models/article-specialization.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { ErrCodes } from '../../types/error-code';
import { awsS3 } from '../../config/s3';
import { FOLDERS } from '../../types/folders';

interface CreateArticleDTO {
  title: string;
  description: string;
  picture?: string;
  specializations: string[]; // Array of specialization IDs
}

export const createArticle: RequestHandler<
  unknown,
  SuccessResponse<{ id: string }>,
  CreateArticleDTO
> = async (req, res, next: NextFunction) => {
  const { title, description, specializations } = req.body;
  let picture: string = '';
  const userId = req.loggedUser.id;
  const pictureFile: Express.Multer.File | undefined = req.file;
  try {
    if (pictureFile) {
      picture = FOLDERS.article + '/' + pictureFile.filename;
      await awsS3.saveBucketFiles(FOLDERS.article, pictureFile);
    }

    const articleRepo = dataSource.getRepository(Article);
    const articleSpecializationRepo = dataSource.getRepository(ArticleSpecialization);
    const article = articleRepo.create({
      title,
      description,
      picture,
      created_by: { id: userId },
    });

    const savedArticle = await articleRepo.save(article);

    if (!savedArticle) return next(new Errors.BadRequest(ErrCodes.BAD_REQUEST));

    if (specializations && specializations.length > 0) {
      const articleSpecializations = specializations.map((specializationId) => {
        return articleSpecializationRepo.create({
          article_id: savedArticle.id,
          specialization_id: specializationId,
        });
      });

      await articleSpecializationRepo.save(articleSpecializations);
    }

    return res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { id: savedArticle.id },
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
