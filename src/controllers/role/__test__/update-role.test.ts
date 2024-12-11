import supertest from 'supertest';
import { v4 } from 'uuid';
import { dataSource } from '../../../config/typeorm';
import { Permission } from '../../../models/permission.model';
import { Role } from '../../../models/role.model';
import { RolePermission } from '../../../models/role_permissions.model';
import { app } from '../../../app';
import { PERMISSIONS } from '../../../types/permissions';
import { SystemRoles } from '../../../types/system-roles';
import { UserAuth, UserType } from '../../../models/user-auth.model';

const request = supertest(app);
let users: UserAuth[];

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save([
      { key: PERMISSIONS.create_role },
      { key: PERMISSIONS.update_role },
      { key: PERMISSIONS.remove_role },
      { key: PERMISSIONS.get_role },
    ]);
  const roles = await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );
  await dataSource
    .getRepository(RolePermission)
    .save(
      roles.flatMap((role) =>
        permissions.map((per) => ({ role_id: { id: role.id }, permission_key: { key: per.key } })),
      ),
    );
  const userId = v4();
  users = await dataSource.getRepository(UserAuth).save([
    {
      id: userId,
      email: 'user1@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      account_provider_id: { id: userId },
    },
  ]);
});

describe('Update Role Controller', () => {
  it('should update a role successfully', async () => {
    const role = await dataSource.getRepository(Role).save({
      key: 'existing_role',
      description: 'Existing Role Description',
      provider: { id: users[0].account_provider_id.id },
    });

    const permissions = await dataSource
      .getRepository(Permission)
      .save([{ key: 'permission1' }, { key: 'permission2' }]);

    const response = await request
      .patch(`/api/v1/roles/${role.id}`)
      .send({
        description: 'Updated Role Description',
        permissions: permissions.map((permission) => permission.key),
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Role updated successfully');

    const updatedRole = await dataSource.getRepository(Role).findOne({ where: { id: role.id } });
    expect(updatedRole).toBeDefined();
    expect(updatedRole?.description).toBe('Updated Role Description');
  });

  it('should return 404 if role is not found', async () => {
    const response = await request
      .patch(`/api/v1/roles/${v4()}`)
      .send({
        description: 'Updated Role Description',
        permissions: [],
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return 404 if role related to another provider', async () => {
    const user = await dataSource.getRepository(UserAuth).save({
      email: 'another_user@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: users[0].role_id.id },
    });
    const role = await dataSource.getRepository(Role).save({
      key: 'existing_role',
      description: 'Existing Role Description',
      provider: { id: user.id },
    });

    const response = await request
      .patch(`/api/v1/roles/${role.id}`)
      .send({
        description: 'Updated Role Description',
        permissions: [],
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return 403 if user has no permission', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const role = await dataSource.getRepository(Role).save({
      key: 'existing_role',
      description: 'Existing Role Description',
      provider: { id: users[0].account_provider_id.id },
    });

    const response = await request
      .patch(`/api/v1/roles/${role.id}`)
      .send({
        description: 'Updated Role Description',
        permissions: [],
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
