import { dataSource } from '../../config/typeorm';
import { ArticleAction } from '../../models/article-action.model';
import { ArticleCommentAction } from '../../models/article-comment-action.model';

export const toggleAction = async (
  Modle: typeof ArticleAction | typeof ArticleCommentAction,
  type: string,
  payload: { userId: string; recordId: string },
): Promise<boolean> => {
  const { userId, recordId } = payload;

  const data: Partial<ArticleAction | ArticleCommentAction> = {
    user_id: userId,
  };
  if (type === 'article') {
    (data as Partial<ArticleAction>).article_id = recordId;
  } else if (type === 'comment') {
    (data as Partial<ArticleCommentAction>).comment_id = recordId;
  }
  try {
    const modelRepo = dataSource.getRepository(Modle);
    const action = await modelRepo.findOne({ where: data as any });
    if (action) {
      await modelRepo.delete(data);
      return true;
    } else {
      await modelRepo.insert(data);
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};
