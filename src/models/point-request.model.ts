import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserAuth } from './user-auth.model';
import { COMMON_MODELS } from '../types/model-names';
import { Point } from './point.model';

export enum PointRequestStatus {
  pending = 0,
  completed = 1,
  remove = 2,
}

export enum PointsRequestType {
  withdraw = 0,
  gift = 1,
}

@Entity(COMMON_MODELS.pointsRequest)
export class pointsRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Point, (point) => point.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'point' })
  point!: Point;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_user' })
  target_user!: UserAuth;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: UserAuth;

  @Column({ type: 'enum', enum: PointsRequestType })
  request_type!: PointsRequestType;

  @Column({ type: 'int2', default: 0, nullable: false })
  status!: PointRequestStatus;

  @Column({ type: 'int', default: 0, nullable: false })
  points!: number;

  @Column({ type: 'int', default: 0, nullable: false })
  withdraw!: number;

  @Column('text', { nullable: true })
  title!: string;

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
