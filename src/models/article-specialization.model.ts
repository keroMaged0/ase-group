import { Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';

import { Article } from './article.model';
import { DoctorSpecialty } from './doctor-specialty.model';
import { COMMON_MODELS } from '../types/model-names';
@Entity(COMMON_MODELS.articleSpecializations)
@Unique(['article', 'specialization']) // Ensure composite key uniqueness
export class ArticleSpecialization {
  @PrimaryColumn('uuid')
  article_id!: string;

  @PrimaryColumn('uuid')
  specialization_id!: string;

  @ManyToOne(() => Article, (article) => article.specializations, {
    onDelete: 'CASCADE', // Automatically remove specializations when an article is deleted
    // eager: true, // Automatically load associated data when querying
  })
  @JoinColumn({ name: 'article_id' })
  article!: Article;

  @ManyToOne(() => DoctorSpecialty, {
    eager: true, // Automatically load associated specialization when querying
    onDelete:'CASCADE'
  })
  @JoinColumn({ name: 'specialization_id' })
  specialization!: DoctorSpecialty;
}
