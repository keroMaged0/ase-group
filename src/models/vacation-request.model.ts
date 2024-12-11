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
import { UserAuth } from './user-auth.model';
import { Vacation } from './vacation.model';

export enum VacationRequestStatus {
  pending = 0,
  approved = 1,
  rejected = 2,
}

export enum VacationRequestType {
  order = 0,
  gift = 1,
}

@Entity({ name: COMMON_MODELS.vacationRequest })
export class VacationRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({ type: 'int', default: 0, nullable: false })
  real_vacation_days!: number;

  @Column({ type: 'int2', default: 0, nullable: false })
  status!: VacationRequestStatus;

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string;

  @Column({ type: 'int2' })
  request_type!: VacationRequestType;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_user_id' })
  target_user!: UserAuth;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: UserAuth;

  @ManyToOne(() => Vacation, (vacation) => vacation.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vacation_id' })
  vacation!: Vacation;
}
