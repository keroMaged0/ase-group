import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { COMMON_MODELS } from '../types/model-names';
import { Reward } from './reward.model';
import { UserAuth } from './user-auth.model';

@Entity({ name: COMMON_MODELS.userReward })
export class UserReward {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ type: 'uuid', nullable: false })
  user_id!: string;

  @Column({ type: 'uuid', nullable: false })
  reward_id!: string;

  @ManyToOne(() => Reward, (reward) => reward.id)
  @JoinColumn({ name: 'reward_id' })
  reward!: Reward;

  @ManyToOne(() => UserAuth)
  @JoinColumn({ name: 'user_id' })
  user!: UserAuth;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
