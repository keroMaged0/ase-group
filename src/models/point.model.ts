import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserAuth } from './user-auth.model';
import { COMMON_MODELS } from '../types/model-names';
import { Product } from './product.model';

@Entity(COMMON_MODELS.points)
export class Point {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product_id!: Product;

  @ManyToOne(() => UserAuth, (userAuth) => userAuth.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider_id!: UserAuth;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: UserAuth;

  @Column('text', { nullable: true })
  name!: string;

  @Column('int', { nullable: true })
  amount!: number;

  @Column('int')
  points!: number;

  @Column('text', { nullable: true })
  description!: string;

  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
