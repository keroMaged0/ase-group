import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { City } from './city.model';
import { Country } from './country.model';
import { COMMON_MODELS } from '../types/model-names';
import { State } from './state.model';
import { DoctorSpecialty } from './doctor-specialty.model';

@Entity({ name: COMMON_MODELS.userProfileDoctor })
export class UserProfileDoctor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  first_name!: string;

  @Column({ nullable: true })
  middle_name!: string;

  @Column({ nullable: true })
  last_name!: string;

  @Column({ nullable: true })
  nickname!: string;

  @Column({ nullable: true })
  gender!: boolean;

  @Column({ nullable: true })
  birth_date!: Date;

  @ManyToOne(() => DoctorSpecialty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'main_specialty_id' })
  main_specialty_id!: DoctorSpecialty;

  @ManyToOne(() => DoctorSpecialty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nested_specialty_id' })
  nested_specialty_id!: DoctorSpecialty;

  @ManyToOne(() => Country, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'country_id' })
  country_id!: Country;

  @ManyToOne(() => City, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city_id!: City;

  @ManyToOne(() => State, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'state_id' })
  state_id!: State;

  @Column({ nullable: true })
  profile_image!: string;

  @Column({ nullable: true })
  passport!: string;

  @Column({ nullable: true })
  address!: string;

  @Column('simple-array', { default: [0, 0] })
  coordinates!: number[];

  @Column({ nullable: true })
  degree!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
