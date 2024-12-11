import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { app } from '../../../app';
import { SystemRoles } from '../../../types/system-roles';
import { Utils } from '../../../utils';
import { env } from '../../../config/env';
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
      is_verified: true,
      is_verified_by_crm: true,
      password: await Utils.Bcrypt.hashPwd('123@Password', env.bcrypt.salt, env.bcrypt.paper),
    },
  ]);
});

describe('change email', () => {
  it('should change email successfully', async () => {
    const response = await request
      .patch('/api/v1/auth/update-email')
      .send({
        email: 'newuser@email.com',
        password: '123@Password',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const user = await dataSource.getRepository(UserAuth).findOne({ where: { id: users[0].id } });
    expect(user).toBeTruthy();
    expect(user!.verification_code).not.toBeNull();
    expect(user!.verification_expire_at).not.toBeNull();
    expect(user!.verification_reason).toBe(VerifyReason.updateEmail);
  });

  it('should return bad request if invalid credentials', async () => {
    const response = await request
      .patch('/api/v1/auth/update-email')
      .send({
        email: 'newuser@email.com',
        password: 'wrongpassword',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(400);
  });

  it('should return bad request if email already exists', async () => {
    await dataSource.getRepository(UserAuth).save({
      email: 'existinguser@email.com',
      phone: '01234567892',
      user_type: UserType.company,
      role_id: { id: users[0].role_id.id },
      is_verified: true,
      is_verified_by_crm: true,
    });

    const response = await request
      .patch('/api/v1/auth/update-email')
      .send({
        email: 'existinguser@email.com',
        password: '123@Password',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(400);
  });

  it('should return 403 if user has no permission to update his email', async () => {
    await dataSource.getRepository(RolePermission).delete({});
    const response = await request
      .patch('/api/v1/auth/update-email')
      .send({
        email: 'newuser@email.com',
        password: '123@Password',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
