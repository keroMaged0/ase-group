import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { City } from './city.model';
import { Country } from './country.model';
import { COMMON_MODELS } from '../types/model-names';
import { State } from './state.model';
import { AllowedVisitTime } from './allowed-visit-times.model';

@Entity({ name: COMMON_MODELS.userProfilePharmacy })
export class UserProfilePharmacy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  name!: string;

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
  address!: string;

  @Column('simple-array', { default: [0, 0] })
  coordinates!: number[];

  @Column({ nullable: true })
  owner_name!: string;

  @Column({ nullable: true })
  owner_phone_number!: string;

  @Column({ nullable: true })
  license_image!: string;

  @Column({ nullable: true })
  license_number!: string;

  @Column({ nullable: true })
  license_holder_name!: string;

  @Column({ nullable: true })
  license_holder_number!: string;

  @Column({ nullable: true })
  nearest_point!: string;

  @Column({ nullable: true })
  pharmacy_number!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
