import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { UserAuth } from './user-auth.model';

@Entity(COMMON_MODELS.doctorReservation)
export class DoctorReservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => UserAuth, (userAuth) => userAuth.id, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor_id!: UserAuth;

  @Column('simple-array')
  phone_numbers!: string[];

  @Column('simple-array')
  emails!: string[];

  @Column()
  address!: string;

  @Column('simple-array', { default: [0, 0] })
  coordinates!: number[];

  @Column()
  lisence_number!: string;

  @Column()
  lisence_image!: string;

  @ManyToOne(() => UserAuth, (userAuth) => userAuth.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nearest_pharmacy_id' })
  nearest_pharmacy_id!: UserAuth;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
