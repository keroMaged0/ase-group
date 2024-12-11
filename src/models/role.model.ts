// create role table columns: key, description, permission is a many to many with Permission table

import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.model';
import { COMMON_MODELS } from '../types/model-names';
import { RolePermission } from './role_permissions.model';
import { UserAuth } from './user-auth.model';

@Entity({ name: COMMON_MODELS.role })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  key!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider!: UserAuth;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role_id, {
    onDelete: 'CASCADE',
  })
  role_permissions!: RolePermission[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
