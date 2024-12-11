import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserAuth } from './user-auth.model';
import { COMMON_MODELS } from '../types/model-names';

@Entity({ name: COMMON_MODELS.reward })
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: false, unique: true })
  title!: string;

  @Column({ name: 'amount', type: 'int', nullable: false })
  amount!: number;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => UserAuth)
  createdBy!: string;
}
