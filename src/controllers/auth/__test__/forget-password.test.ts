import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { app } from '../../../app';
import { SystemRoles } from '../../../types/system-roles';
import { Utils } from '../../../utils';
import { env } from '../../../config/env';
import { VerifyReason } from '../../../types/verify-reason';

const request = supertest(app);
let users;

beforeEach(async () => {
  const roles = await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );

  users = await dataSource.getRepository(UserAuth).save([
    {
      email: 'user1@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      password: await Utils.Bcrypt.hashPwd('123@Password', env.bcrypt.salt, env.bcrypt.paper),
    },
  ]);
});

describe('forget password', () => {
  it('should send verification code successfully', async () => {
    const response = await request.post('/api/v1/auth/forget-password').send({
      email: 'user1@email.com',
    });

    expect(response.status).toBe(200);

    const user = await dataSource
      .getRepository(UserAuth)
      .findOne({ where: { email: 'user1@email.com' } });
    expect(user).toBeTruthy();
    expect(user!.verification_code).not.toBeNull();
    expect(user!.verification_expire_at).not.toBeNull();
    expect(user!.verification_reason).toBe(VerifyReason.updatePassword);
  });

  it('should return bad request if email not found', async () => {
    const response = await request.post('/api/v1/auth/forget-password').send({
      email: 'nonexistent@email.com',
    });

    expect(response.status).toBe(400);
  });

  it('should return bad request if user is not verified', async () => {
    await dataSource.getRepository(UserAuth).save({
      email: 'unverifieduser@email.com',
      phone: '01234567892',
      user_type: UserType.company,
      role_id: { id: users[0].role_id.id },
      is_verified: false,
      is_verified_by_crm: true,
    });

    const response = await request.post('/api/v1/auth/forget-password').send({
      email: 'unverifieduser@email.com',
    });

    expect(response.status).toBe(400);
  });

  it('should update password successfully', async () => {
    const code = await Utils.Crypto.generateCode();
    await dataSource.getRepository(UserAuth).update(
      { email: 'user1@email.com' },
      {
        verification_code: Utils.Crypto.hashCode(code),
        verification_expire_at: new Date(Date.now() + 10 * 60 * 1000),
        verification_reason: VerifyReason.updatePassword,
      },
    );

    await dataSource.getRepository(UserAuth).update(
      { email: 'user1@email.com' },
      {
        verification_reason: VerifyReason.updatePasswordVerified,
      },
    );

    const response = await request.patch('/api/v1/auth/forget-password').send({
      email: 'user1@email.com',
      new_password: 'New@Password123',
    });

    expect(response.status).toBe(200);

    const user = await dataSource
      .getRepository(UserAuth)
      .findOne({ where: { email: 'user1@email.com' } });
    expect(user).toBeTruthy();
    expect(user!.verification_code).toBeNull();
    expect(user!.verification_expire_at).toBeNull();
    expect(user!.verification_reason).toBeNull();
  });

  it('should return bad request if verification code not verified', async () => {
    const response = await request.patch('/api/v1/auth/forget-password').send({
      email: 'user1@email.com',
      new_password: 'New@Password123',
    });

    expect(response.status).toBe(400);
  });
});
