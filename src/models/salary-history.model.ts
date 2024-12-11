import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { Salary } from './salary.model';

@Entity({ name: COMMON_MODELS.salaryHistory })
export class SalaryHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @Column({ name: 'target_user', type: 'uuid', nullable: false, unique: true })
  // target_user!: string;

  @Column({ name: 'salary_id', type: 'uuid', nullable: false })
  salary_id!: string;

  @Column({ name: 'real_salary', type: 'float', nullable: false })
  real_salary!: number;

  @Column({ name: 'commissions', type: 'float', nullable: true })
  commissions!: number;

  @Column({ name: 'is_received', type: 'boolean', default: false })
  is_received!: boolean;

  @Column({ name: 'paid_at', type: 'timestamp' , nullable:true})
  paid_at!: Date;

  @ManyToOne(() => Salary, {onDelete:'CASCADE'})
  @JoinColumn({ name: 'salary_id' })
  salary!: Salary;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
