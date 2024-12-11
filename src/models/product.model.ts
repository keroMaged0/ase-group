import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { MedicineCategory } from './medicine_category.model';
import { UserAuth } from './user-auth.model';

@Entity({ name: COMMON_MODELS.product })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => MedicineCategory, (MedicineCategory) => MedicineCategory.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medicine_category_id' })
  medicine_category_id!: MedicineCategory;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ nullable: true })
  cover_image?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'integer' })
  quantity!: number;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider_id!: UserAuth;

  @Column()
  scientific_name!: string;

  @Column()
  caliber!: string;

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
