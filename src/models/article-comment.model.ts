import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { UserProfileDoctor } from './user-profile-doctor.model';
import { Article } from './article.model';
import { UserAuth } from './user-auth.model';
import { ArticleCommentAction } from './article-comment-action.model';

@Entity(COMMON_MODELS.articleComments)
export class ArticleComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ArticleComment, (comment) => comment.replies, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: ArticleComment;

  @ManyToOne(() => Article, (article) => article.comments, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'article_id' })
  article!: Article;

  @ManyToOne(() => UserAuth, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'user_id' })
  user!: UserAuth;

  @Column('text')
  content!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToMany(() => ArticleComment, (comment) => comment.parent)
  replies!: ArticleComment[];

  @OneToMany(() => ArticleCommentAction, (action) => action.comment, { onDelete: 'CASCADE' })
  actions!: ArticleCommentAction[];
}
