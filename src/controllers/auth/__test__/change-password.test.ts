import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { app } from '../../../app';
import { SystemRoles } from '../../../types/system-roles';
import { Utils } from '../../../utils';
import { env } from '../../../config/env';
import { Permission } from '../../../models/permission.model';
import { PERMISSIONS } from '../../../types/permissions';
import { RolePermission } from '../../../models/role_permissions.model';

const request = supertest(app);
let users;

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.change_password });
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

describe('change password', () => {
  it('should change password successfully', async () => {
    const response = await request
      .patch('/api/v1/auth/change-password')
      .send({
        old_password: '123@Password',
        new_password: 'New@Password1',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const user = await dataSource.getRepository(UserAuth).findOne({ where: { id: users[0].id } });
    const isMatch = await Utils.Bcrypt.comparePwd(
      'New@Password1',
      user!.password,
      env.bcrypt.paper,
    );
    expect(isMatch).toBe(true);
  });

  it('should return bad request if old password is incorrect', async () => {
    const response = await request
      .patch('/api/v1/auth/change-password')
      .send({
        old_password: 'wrongpassword',
        new_password: 'New@Password1',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(400);
  });

  it('should return bad request if new password is not strong enough', async () => {
    const response = await request
      .patch('/api/v1/auth/change-password')
      .send({
        old_password: '123@Password',
        new_password: 'weakpassword',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(422);
  });

  it('should return 403 if user has no permission to change password', async () => {
    await dataSource.getRepository(RolePermission).delete({});
    const response = await request
      .patch('/api/v1/auth/change-password')
      .send({
        old_password: '123@Password',
        new_password: 'New@Password1',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
