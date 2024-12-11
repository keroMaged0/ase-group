import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { UserAuth } from './user-auth.model';
import { OneToOne, JoinColumn } from 'typeorm';

@Entity({ name: COMMON_MODELS.allowedVisitTime })
export class AllowedVisitTime {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => UserAuth, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user_id!: UserAuth;

  @Column({ type: 'time', default: null })
  saturday_time_start!: string;

  @Column({ type: 'time', default: null })
  saturday_time_end!: string;

  @Column({ type: 'time', default: null })
  sunday_time_start!: string;

  @Column({ type: 'time', default: null })
  sunday_time_end!: string;

  @Column({ type: 'time', default: null })
  monday_time_start!: string;

  @Column({ type: 'time', default: null })
  monday_time_end!: string;

  @Column({ type: 'time', default: null })
  tuesday_time_start!: string;

  @Column({ type: 'time', default: null })
  tuesday_time_end!: string;

  @Column({ type: 'time', default: null })
  wednesday_time_start!: string;

  @Column({ type: 'time', default: null })
  wednesday_time_end!: string;

  @Column({ type: 'time', default: null })
  thursday_time_start!: string;

  @Column({ type: 'time', default: null })
  thursday_time_end!: string;

  @Column({ type: 'time', default: null })
  friday_time_start!: string;

  @Column({ type: 'time', default: null })
  friday_time_end!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
