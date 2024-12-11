import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { COMMON_MODELS } from '../types/model-names';
import { Role } from './role.model';
import { UserProfileCompany } from './user-profile-company.model';
import { UserProfilePharmacy } from './user-profile-pharmacy.model';
import { UserProfileDoctor } from './user-profile-doctor.model';

export enum UserType {
  company,
  pharmacy,
  doctor,
}

@Entity({ name: COMMON_MODELS.userAuth })
export class UserAuth {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, unique: true })
  uid!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: true })
  job_title!: string;

  @Column({ nullable: true })
  password!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  verification_code!: string;

  @Column({ nullable: true })
  verification_expire_at!: Date;

  @Column({ nullable: true })
  verification_reason!: string;

  @Column({ nullable: true })
  verification_temp_email!: string;

  @Column({ nullable: true })
  verification_temp_phone_number!: string;

  @Column({ default: false })
  is_verified!: boolean;

  @Column({ nullable: true })
  token!: string;

  @Column({ type: 'int2', nullable: false })
  user_type!: number;

  @Column({ nullable: true })
  fcm_token!: string;

  @Column({ nullable: true })
  deleted_at!: Date;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by!: UserAuth;

  @Column({ nullable: false, default: false })
  is_verified_by_crm!: boolean;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deleted_by' })
  deleted_by!: UserAuth;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by' })
  invited_by!: UserAuth;

  @ManyToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_provider_id' })
  account_provider_id!: UserAuth;

  @ManyToOne(() => Role, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'role_id' })
  role_id!: Role;

  @OneToOne(() => UserProfileCompany, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_company_profile_id' })
  user_company_profile!: UserProfileCompany;

  @OneToOne(() => UserProfilePharmacy, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_pharmacy_profile_id' })
  user_pharmacy_profile!: UserProfilePharmacy;

  @OneToOne(() => UserProfileDoctor, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_doctor_profile_id' })
  user_doctor_profile!: UserProfileDoctor;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
