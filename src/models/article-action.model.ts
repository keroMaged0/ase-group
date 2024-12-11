import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { UserAuth } from './user-auth.model';
import { Article } from './article.model';

@Entity(COMMON_MODELS.articleActions)
export class ArticleAction {
  @PrimaryColumn('uuid')
  article_id!: string;

  @PrimaryColumn('uuid')
  user_id!: string;

  @ManyToOne(() => UserAuth, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'user_id' })
  user!: UserAuth;

  @ManyToOne(() => Article, (article) => article.actions, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'article_id' })
  article!: Article;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
