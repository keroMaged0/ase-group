import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { UserProfileCompany } from '../../../models/user-profile-company.model';
import { app } from '../../../app';
import { SystemRoles } from '../../../types/system-roles';
import { UserProfilePharmacy } from '../../../models/user-profile-pharmacy.model';
import { UserProfileDoctor } from '../../../models/user-profile-doctor.model';
import { Utils } from '../../../utils';
import { env } from '../../../config/env';

const request = supertest(app);
let users;

beforeEach(async () => {
  const roles = await dataSource
    .getRepository(Role)
    .save(Object.values(SystemRoles).map((role) => ({ key: role })));

  const companyProfile = await dataSource.getRepository(UserProfileCompany).save({});
  const pharmacyProfile = await dataSource.getRepository(UserProfilePharmacy).save({});
  const doctorProfile = await dataSource.getRepository(UserProfileDoctor).save({});

  users = await dataSource.getRepository(UserAuth).save([
    {
      email: 'company@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      password: await Utils.Bcrypt.hashPwd('123@Password', env.bcrypt.salt, env.bcrypt.paper),
      user_company_profile: { id: companyProfile.id },
    },
    {
      email: 'pharmacy@email.com',
      phone: '01234567892',
      user_type: UserType.pharmacy,
      role_id: { id: roles.find((role) => role.key === SystemRoles.pharmacy_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      password: await Utils.Bcrypt.hashPwd('123@Password', env.bcrypt.salt, env.bcrypt.paper),
      user_pharmacy_profile: { id: pharmacyProfile.id },
    },
    {
      email: 'doctor1@email.com',
      phone: '01234567893',
      user_type: UserType.doctor,
      role_id: { id: roles.find((role) => role.key === SystemRoles.doctor)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      password: await Utils.Bcrypt.hashPwd('123@Password', env.bcrypt.salt, env.bcrypt.paper),
      user_doctor_profile: { id: doctorProfile.id },
    },
  ]);
});

describe('signin', () => {
  it('signin company user', async () => {
    const response = await request.post('/api/v1/auth/signin').send({
      email: 'company@email.com',
      password: '123@Password',
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('access_token');
    expect(response.body.data).toHaveProperty('refresh_token');
  });

  it('signin pharmacy user', async () => {
    const response = await request.post('/api/v1/auth/signin').send({
      email: 'pharmacy@email.com',
      password: '123@Password',
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('access_token');
    expect(response.body.data).toHaveProperty('refresh_token');
  });

  it('signin doctor user', async () => {
    const response = await request.post('/api/v1/auth/signin').send({
      email: 'doctor1@email.com',
      password: '123@Password',
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('access_token');
    expect(response.body.data).toHaveProperty('refresh_token');
  });

  it('should return bad request if invalid credentials', async () => {
    const response = await request.post('/api/v1/auth/signin').send({
      email: 'invalid@email.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(400);
  });

  it('should return not allowed if user is not verified', async () => {
    await dataSource.getRepository(UserAuth).save({
      email: 'unverified@email.com',
      phone: '01234567894',
      user_type: UserType.company,
      role_id: {
        id: (
          await dataSource
            .getRepository(Role)
            .findOne({ where: { key: SystemRoles.company_owner } })
        )?.id,
      },
      is_verified: false,
      is_verified_by_crm: true,
      password: await Utils.Bcrypt.hashPwd('123@Password', env.bcrypt.salt, env.bcrypt.paper),
    });

    const response = await request.post('/api/v1/auth/signin').send({
      email: 'unverified@email.com',
      password: '123@Password',
    });

    expect(response.status).toBe(400);
  });

  it('should return not allowed if user is not verified by CRM', async () => {
    await dataSource.getRepository(UserAuth).save({
      email: 'unverifiedcrm@email.com',
      phone: '01234567895',
      user_type: UserType.company,
      role_id: {
        id: (
          await dataSource
            .getRepository(Role)
            .findOne({ where: { key: SystemRoles.company_owner } })
        )?.id,
      },
      is_verified: true,
      is_verified_by_crm: false,
      password: await Utils.Bcrypt.hashPwd('123@Password', env.bcrypt.salt, env.bcrypt.paper),
    });

    const response = await request.post('/api/v1/auth/signin').send({
      email: 'unverifiedcrm@email.com',
      password: '123@Password',
    });

    expect(response.status).toBe(400);
  });
});
