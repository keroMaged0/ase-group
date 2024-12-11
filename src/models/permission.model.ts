import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Column, ManyToOne, JoinColumn } from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { RolePermission } from './role_permissions.model';

@Entity({ name: COMMON_MODELS.permission })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  key!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Permission, (permission) => permission.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Permission;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission_key, {
    onDelete: 'CASCADE',
  })
  rolePermissions!: RolePermission[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
