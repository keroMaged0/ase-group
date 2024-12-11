import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { app } from '../../../app';
import { SystemRoles } from '../../../types/system-roles';

const request = supertest(app);

beforeEach(async () => {
  await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );
});

describe('signup', () => {
  it('signup company user', async () => {
    const response = await request.post('/api/v1/auth/signup').send({
      user_type: 'company',
      email: 'company@email.com',
      password: '123@Password',
      gender: 'male',
      phone: '01234567891',
    });
    expect(response.status).toBe(201);

    const user = await dataSource.getRepository(UserAuth).findOne({
      where: { email: 'company@email.com' },
      relations: ['role_id'],
    });

    expect(user).toBeTruthy();
    expect(user?.user_type).toBe(UserType.company);
    expect(user?.role_id.key).toBe(SystemRoles.company_owner);
  });

  it('signup pharmacy user', async () => {
    const response = await request.post('/api/v1/auth/signup').send({
      user_type: 'pharmacy',
      email: 'pharmacy@email.com',
      password: '123@Password',
      owner_name: 'Owner Name',
      owner_phone_number: '01234567891',
      phone: '01234567891',
    });
    console.log(response.body);

    expect(response.status).toBe(201);

    const user = await dataSource.getRepository(UserAuth).findOne({
      where: { email: 'pharmacy@email.com' },
      relations: ['role_id'],
    });

    expect(user).toBeTruthy();
    expect(user?.user_type).toBe(UserType.pharmacy);
    expect(user?.role_id.key).toBe(SystemRoles.pharmacy_owner);
  });

  it('signup doctor user', async () => {
    const response = await request.post('/api/v1/auth/signup').send({
      user_type: 'doctor',
      email: 'doctor@email.com',
      password: '123@Password',
      gender: 'male',
      phone: '01234567891',
    });

    expect(response.status).toBe(201);

    const user = await dataSource.getRepository(UserAuth).findOne({
      where: { email: 'doctor@email.com' },
      relations: ['role_id'],
    });

    expect(user).toBeTruthy();
    expect(user?.user_type).toBe(UserType.doctor);
    expect(user?.role_id.key).toBe(SystemRoles.doctor);
  });
});
