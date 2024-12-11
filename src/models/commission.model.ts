import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserAuth } from './user-auth.model';
import { COMMON_MODELS } from '../types/model-names';

export enum CommissionType {
  TypeOne = 0,
  TypeTwo = 1,
  TypeThree = 2,
}

@Entity({ name: COMMON_MODELS.commissions })
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int2' })
  commission_type!: CommissionType;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider_id!: UserAuth;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage!: number;

  @Column({ type: 'int' })
  collection_duration_days!: number;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: UserAuth;
}
