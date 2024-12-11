import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { Category } from './book-category.model';
import { UserAuth } from './user-auth.model';

@Entity({ name: COMMON_MODELS.book })
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  fileUrl!: string;

  @ManyToOne(() => Category, (category) => category.books, { eager: true })
  category!: Category;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @ManyToOne(() => UserAuth)
  @JoinColumn({ name: 'created_by' })
  created_by!: UserAuth;
}
