import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { Commission } from './commission.model';
import { UserAuth } from './user-auth.model';
import { Invoice } from './invoice.model';

export enum CommissionRequestStatus {
  Done = 0,
  NotDone = 1,
}

export enum CollectType {
  Full = 0,
  Part = 1,
}

@Entity({ name: COMMON_MODELS.commissionRequest })
export class CommissionRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Commission)
  commission!: Commission;

  @Column({
    type: 'enum',
    enum: CommissionRequestStatus,
  })
  status!: CommissionRequestStatus;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => UserAuth)
  @JoinColumn({ name: 'target_user_id' })
  target_user!: UserAuth;

  @Column({ type: 'timestamp' })
  collected_at!: Date;

  @Column({
    type: 'enum',
    enum: CollectType,
    nullable: true,
  })
  collect_type!: CollectType;

  @ManyToOne(() => Invoice, (invoice) => invoice)
  @JoinColumn({ name: 'invoice' })
  invoice!: Invoice;

  @ManyToOne(() => UserAuth)
  @JoinColumn({ name: 'provider_id' })
  provider_id!: UserAuth;
}
