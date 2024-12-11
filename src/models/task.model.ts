import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { UserAuth } from './user-auth.model';
import { TASK_STATUS } from '../types/task-status';

@Entity({ name: COMMON_MODELS.task })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string;

  @Column({ type: 'enum', enum: TASK_STATUS, default: TASK_STATUS.pending })
  status!: TASK_STATUS;

  @Column({ type: 'timestamp', nullable: false })
  start_at!: Date;

  @Column({ type: 'timestamp', nullable: false })
  end_at!: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @Column({ type: 'uuid', nullable: false })
  provider_id!: string;

  @ManyToOne(() => UserAuth, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'provider_id' })
  provider!: UserAuth;

  @Column({ type: 'uuid', nullable: false })
  created_by!: string;

  @ManyToOne(() => UserAuth, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'created_by' })
  createdBy!: UserAuth;

  @Column({ type: 'uuid', nullable: false })
  target_user!: string;

  @ManyToOne(() => UserAuth, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'target_user' })
  targetUser!: UserAuth;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // checkIfExpired(): void {
  //   const currentDate = new Date();
  //   if (this.end_at <= currentDate && this.status !== TaskStatus.ENDED) {
  //     this.status = TaskStatus.ENDED;
  //   }
  // }
}
