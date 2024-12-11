import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { UserAuth } from './user-auth.model';

@Entity({ name: COMMON_MODELS.salary })
export class Salary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'amount', nullable: false, type: 'float' })
  amount!: number;

  @Column({ name: 'sales_ratio', type: 'float4', nullable: true, default: 0 })
  sales_ratio!: number;


  @Column({ name: 'target_user', type: 'uuid', nullable: false, unique: true })
  target_user!: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: false })
  created_by!: string;

  @Column({ name: 'provider_id', type: 'uuid', nullable: false })
  provider_id!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @ManyToOne(() => UserAuth)
  @JoinColumn({ name: 'target_user' })
  employee!: UserAuth;

  @ManyToOne(() => UserAuth)
  @JoinColumn({ name: 'created_by' })
  created_by_user!: UserAuth;

  @ManyToOne(() => UserAuth)
  @JoinColumn({ name: 'provider_id' })
  provider!: UserAuth;
}
