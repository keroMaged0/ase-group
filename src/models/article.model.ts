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

import { ArticleSpecialization } from './article-specialization.model';
import { UserAuth } from './user-auth.model';
import { COMMON_MODELS } from '../types/model-names';
import { ArticleAction } from './article-action.model';
import { ArticleComment } from './article-comment.model';

@Entity(COMMON_MODELS.articles)
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'text', nullable: true })
  picture!: string;

  @ManyToOne(() => UserAuth, { eager: true, onDelete:'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  created_by!: UserAuth;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToMany(() => ArticleSpecialization, (specialization) => specialization.article, {
    cascade: true, // Propagates insert, update, and remove operations
    eager: true, // Automatically load associated data when querying
    onDelete: 'CASCADE', // Automatically remove specializations when an article is deleted
  })
  specializations!: ArticleSpecialization[];

  @OneToMany(() => ArticleAction, (articleAction) => articleAction.article, {
    cascade: true,
    eager: true,
    onDelete:'CASCADE'
  })
  @JoinColumn({ name: 'actions' })
  actions!: ArticleAction[];

  @OneToMany(() => ArticleComment, (comment) => comment.article, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comments' })
  comments!: ArticleComment[];
}
