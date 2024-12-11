import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { UserAuth } from './user-auth.model';
import { COMMON_MODELS } from '../types/model-names';
import { Product } from './product.model';

export enum TargetType {
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
}

export enum TargetStatus {
  InProgress = 'In Progress',
  Completed = 'Completed',
  Expired = 'Expired',
}

@Entity(COMMON_MODELS.target)
export class Target {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserAuth, (userAuth) => userAuth.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee_id!: UserAuth;

  @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product_id!: Product;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider_id!: UserAuth;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: UserAuth;

  @Column({
    type: 'enum',
    enum: TargetType,
    default: TargetType.Monthly,
  })
  target_type!: TargetType;

  @Column('int')
  target_quantity?: number;

  @Column('int', { default: 0, nullable: true })
  achieved_quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  target_amount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, nullable: true })
  achieved_amount!: number;

  @Column({
    type: 'enum',
    enum: TargetStatus,
    default: TargetStatus.InProgress,
  })
  status!: TargetStatus;

  @Column({ type: 'timestamp' })
  start_date!: Date;

  @Column({ type: 'timestamp' })
  end_date!: Date;

  @Column({ default: false })
  is_deleted?: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  updateStatusBasedOnDate() {
    const currentDate = new Date();
    if (this.end_date < currentDate) {
      this.status = TargetStatus.Expired;
    }
  }

  get progressPercentage(): number {
    if (!this.target_quantity || this.target_quantity === 0) {
      return 0;
    }
    return Math.min((this.achieved_quantity / this.target_quantity) * 100, 100);
  }
}
