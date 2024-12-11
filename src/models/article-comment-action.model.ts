import { Entity, JoinColumn, ManyToOne, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { UserAuth } from './user-auth.model';
import { COMMON_MODELS } from '../types/model-names';
import { ArticleComment } from './article-comment.model';

@Entity(COMMON_MODELS.articleCommentActions)
export class ArticleCommentAction {
  @PrimaryColumn('uuid')
  comment_id!: string;

  @PrimaryColumn('uuid')
  user_id!: string;

  @ManyToOne(() => UserAuth, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'user_id' })
  user!: UserAuth;

  @ManyToOne(() => ArticleComment, (comment) => comment.actions, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'comment_id' })
  comment!: ArticleComment;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
