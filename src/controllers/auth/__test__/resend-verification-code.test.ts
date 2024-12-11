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

describe('resend verification code', () => {
  it('should resend verification code successfully', async () => {
    await dataSource
      .getRepository(UserAuth)
      .update(
        { email: 'user1@email.com' },
        { verification_expire_at: new Date(Date.now() - 10 * 60 * 1000) },
      );

    const response = await request.post('/api/v1/auth/verification-code/resend').send({
      email: 'user1@email.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.message).toBe('Code sent Successfully');
    expect(response.body.data.reason).toBe(VerifyReason.signup);
  });

  it('should return bad request if no reason to resend code', async () => {
    await dataSource
      .getRepository(UserAuth)
      .update({ email: 'user1@email.com' }, { verification_reason: null as any });

    const response = await request.post('/api/v1/auth/verification-code/resend').send({
      email: 'user1@email.com',
    });

    expect(response.status).toBe(400);
  });

  it('should return not found if user does not exist', async () => {
    const response = await request.post('/api/v1/auth/verification-code/resend').send({
      email: 'nonexistent@email.com',
    });

    expect(response.status).toBe(404);
  });

  it('should return remaining time if code is not expired', async () => {
    const response = await request.post('/api/v1/auth/verification-code/resend').send({
      email: 'user1@email.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe('You have to wait before sending the code again');
    expect(response.body.data.remainingTime).toBeGreaterThan(0);
  });
});
