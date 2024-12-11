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
import { Punishment } from './punishments.model';

@Entity({ name: COMMON_MODELS.punishmentRequests })
export class PunishmentRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: UserAuth;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @ManyToOne(() => Punishment, (punishment) => punishment.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'punishment_id' })
  punishment!: Punishment;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_user_id' })
  target_user!: UserAuth;

}
