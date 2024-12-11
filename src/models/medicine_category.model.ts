import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { COMMON_MODELS } from '../types/model-names';
import { UserAuth } from './user-auth.model';
import { Product } from './product.model';

@Entity({ name: COMMON_MODELS.medicineCategory })
export class MedicineCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  cover_image?: string;

  @ManyToOne(() => MedicineCategory, (MedicineCategory) => MedicineCategory.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent_id!: MedicineCategory | null;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider_id!: UserAuth;

  @OneToMany(() => Product, (product) => product.medicine_category_id)
  products!: Product[];

  @Column({ default: false })
  is_deleted?: boolean;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: UserAuth;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
