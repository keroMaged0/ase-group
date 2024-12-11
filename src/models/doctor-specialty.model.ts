import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { ArticleSpecialization } from './article-specialization.model';

@Entity({ name: COMMON_MODELS.doctorSpecialty })
export class DoctorSpecialty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ unique: true })
  title!: string;
  @Column()
  description!: string;

  @ManyToOne(() => DoctorSpecialty, (doctorSpecialty) => doctorSpecialty.id, {
    onDelete: 'CASCADE',
  })
  parent_id!: DoctorSpecialty;

  @OneToMany(() => ArticleSpecialization, (articleSpec) => articleSpec.specialization, {
    onDelete: 'SET NULL',
  })
  articles!: ArticleSpecialization[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @Column({ default: false })
  isDeleted!: boolean;
}
