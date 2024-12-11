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

describe('Create Role Controller', () => {
  it('should create a role successfully', async () => {
    const permissions = await dataSource
      .getRepository(Permission)
      .save([{ key: 'permission1' }, { key: 'permission2' }]);
    const response = await request
      .post(`/api/v1/roles`)
      .send({
        key: 'new_role',
        description: 'New Role Description',
        permissions: permissions.map((permission) => permission.id),
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.key).toBe('new_role');

    const role = await dataSource
      .getRepository(Role)
      .findOne({ where: { id: response.body.data.id } });
    expect(role).toBeDefined();
  });

  it('should return 403 if user has no permission', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const response = await request
      .post(`/api/v1/roles`)
      .send({
        key: 'new_role',
        description: 'New Role Description',
        permissions: [],
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
