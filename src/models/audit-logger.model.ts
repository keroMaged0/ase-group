import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';

@Entity({ name: COMMON_MODELS.auditLog })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column({ enum: ['create', 'update', 'delete'] })
  action!: string;

  @Column()
  entity!: string;

  @Column()
  entityId!: number;

  @Column()
  userId!: number;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({ type: 'json', nullable: true })
  oldValue!: any;

  @Column({ type: 'json', nullable: true })
  newValue!: any;

  @Column()
  description!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
