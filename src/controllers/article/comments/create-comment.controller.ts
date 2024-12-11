import { RequestHandler } from 'express';
import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { ArticleComment } from '../../../models/article-comment.model';
import { Errors } from '../../../errors';
import { ErrCodes } from '../../../types/error-code';

interface ICommentBody {
  parentId?: string;
  articleId: string;
  content: string;
}

export const createComment: RequestHandler<
  unknown,
  SuccessResponse<{ id: string } | null>
> = async (req, res, next) => {
  const { parentId, articleId, content } = req.body as ICommentBody;
  const userId = req.loggedUser.id;
  let comment: ArticleComment;
  try {
    const commentRepo = dataSource.getRepository(ArticleComment);
    // create the comment
    // if the comment has no parent, then it is a root comment
    if (!parentId) {
      comment = commentRepo.create({
        article: { id: articleId },
        user: { id: userId },
        content,
      });
      await commentRepo.save(comment);
      return res.json({
        success: true,
        message: 'comment created successfully',
        data: { id: comment.id },
      });
    }

    const parent = await commentRepo.findOne({ where: { id: parentId }, relations: ['parent'] });
    if (!parent) return next(new Errors.NotFound(ErrCodes.NOT_FOUND));
    console.log(parent);
    // if the comment has parent and the parent has parent, then it is a reply to a reply
    if (parent?.parent?.id)
      return res.status(400).json({
        success: false,
        message: 'sorry you can not  reply to a reply',
        data: null,
      });

    comment = commentRepo.create({
      parent: { id: parentId },
      user: { id: userId },
      article: { id: articleId },
      content,
    });
    await commentRepo.save(comment);
    res.status(200).json({
      success: true,
      data: {
        id: comment.id,
      },
      message: 'Comment created successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to create comment',
    });
  }
};
