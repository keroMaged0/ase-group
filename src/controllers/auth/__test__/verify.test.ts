import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { app } from '../../../app';
import { SystemRoles } from '../../../types/system-roles';
import { Utils } from '../../../utils';
import { VerifyReason } from '../../../types/verify-reason';
import { Permission } from '../../../models/permission.model';
import { PERMISSIONS } from '../../../types/permissions';
import { RolePermission } from '../../../models/role_permissions.model';

const request = supertest(app);
let users;

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.update_email });
  const roles = await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );
  await dataSource
    .getRepository(RolePermission)
    .save(
      roles.map((role) => ({ role_id: { id: role.id }, permission_key: { key: permissions.key } })),
    );

  users = await dataSource.getRepository(UserAuth).save([
    {
      email: 'user1@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: false,
      verification_code: Utils.Crypto.hashCode('123456'),
      verification_expire_at: new Date(Date.now() + 10 * 60 * 1000),
      verification_reason: VerifyReason.signup,
    },
  ]);
});

describe('verify', () => {
  it('should verify user successfully', async () => {
    const response = await request.post('/api/v1/auth/verification-code/verify').send({
      email: 'user1@email.com',
      code: '123456',
    });

    expect(response.status).toBe(200);

    const user = await dataSource
      .getRepository(UserAuth)
      .findOne({ where: { email: 'user1@email.com' } });
    expect(user).toBeTruthy();
    expect(user!.is_verified).toBe(true);
    expect(user!.verification_code).toBeNull();
    expect(user!.verification_expire_at).toBeNull();
    expect(user!.verification_reason).toBeNull();
  });

  it('should return bad request if invalid verification code', async () => {
    const response = await request.post('/api/v1/auth/verification-code/verify').send({
      email: 'user1@email.com',
      code: 'wrongcode',
    });

    expect(response.status).toBe(400);
  });

  it('should return bad request if verification code is expired', async () => {
    await dataSource
      .getRepository(UserAuth)
      .update(
        { email: 'user1@email.com' },
        { verification_expire_at: new Date(Date.now() - 10 * 60 * 1000) },
      );

    const response = await request.post('/api/v1/auth/verification-code/verify').send({
      email: 'user1@email.com',
      code: '123456',
    });

    expect(response.status).toBe(400);
  });

  it('should return bad request if no reason to verify', async () => {
    await dataSource
      .getRepository(UserAuth)
      .update(
        { email: 'user1@email.com' },
        { verification_reason: null as any, is_verified: true },
      );

    const response = await request.post('/api/v1/auth/verification-code/verify').send({
      email: 'user1@email.com',
      code: '123456',
    });

    expect(response.status).toBe(400);
  });

  it('should return bad request if email is invalid', async () => {
    const response = await request.post('/api/v1/auth/verification-code/verify').send({
      email: 'invalid@email.com',
      code: '123456',
    });

    expect(response.status).toBe(400);
  });

  it('should verify user who asked to update forgotten password', async () => {
    await dataSource.getRepository(UserAuth).update(
      { email: 'user1@email.com' },
      {
        verification_reason: VerifyReason.updatePassword,
        verification_code: Utils.Crypto.hashCode('654321'),
      },
    );

    const response = await request.post('/api/v1/auth/verification-code/verify').send({
      email: 'user1@email.com',
      code: '654321',
    });

    expect(response.status).toBe(200);

    const user = await dataSource
      .getRepository(UserAuth)
      .findOne({ where: { email: 'user1@email.com' } });
    expect(user).toBeTruthy();
    expect(user!.verification_reason).toBe(VerifyReason.updatePasswordVerified);
  });

  it('should verify user account after signup', async () => {
    const response = await request.post('/api/v1/auth/verification-code/verify').send({
      email: 'user1@email.com',
      code: '123456',
    });

    expect(response.status).toBe(200);

    const user = await dataSource
      .getRepository(UserAuth)
      .findOne({ where: { email: 'user1@email.com' } });
    expect(user).toBeTruthy();
    expect(user!.is_verified).toBe(true);
    expect(user!.verification_code).toBeNull();
    expect(user!.verification_expire_at).toBeNull();
    expect(user!.verification_reason).toBeNull();
  });

  it('should verify update email and update email in user_auth', async () => {
    await dataSource.getRepository(UserAuth).update(
      { email: 'user1@email.com' },
      {
        verification_reason: VerifyReason.updateEmail,
        verification_code: Utils.Crypto.hashCode('654321'),
        verification_temp_email: 'newuser@email.com',
      },
    );

    const response = await request.post('/api/v1/auth/verification-code/verify').send({
      email: 'user1@email.com',
      code: '654321',
    });

    expect(response.status).toBe(200);

    const user = await dataSource
      .getRepository(UserAuth)
      .findOne({ where: { email: 'newuser@email.com' } });
    expect(user).toBeTruthy();
    expect(user!.email).toBe('newuser@email.com');
    expect(user!.verification_code).toBeNull();
    expect(user!.verification_expire_at).toBeNull();
    expect(user!.verification_reason).toBeNull();
  });
});
