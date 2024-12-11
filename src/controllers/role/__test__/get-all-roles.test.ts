import supertest from 'supertest';
import { v4 } from 'uuid';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { RolePermission } from '../../../models/role_permissions.model';
import { Permission } from '../../../models/permission.model';
import { app } from '../../../app';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { SystemRoles } from '../../../types/system-roles';
import { PERMISSIONS } from '../../../types/permissions';

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

describe('Get All Roles Controller', () => {
  it('should fetch all roles successfully', async () => {
    const response = await request.get('/api/v1/roles').set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Roles fetched successfully');
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('should return roles with permission count', async () => {
    const role = await dataSource.getRepository(Role).save({
      key: 'test_role',
      description: 'Test Role Description',
      provider: { id: users[0].account_provider_id.id },
    });

    const permissions = await dataSource
      .getRepository(Permission)
      .save([{ key: 'permission1' }, { key: 'permission2' }]);

    await dataSource.getRepository(RolePermission).save(
      permissions.map((permission) => ({
        role_id: { id: role.id },
        permission_key: { key: permission.key },
      })),
    );

    const response = await request.get('/api/v1/roles').set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: role.id,
          key: role.key,
          description: role.description,
          permission_count: '2',
        }),
      ]),
    );
  });

  it('should return 403 if user has no permission', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const response = await request.get('/api/v1/roles').set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
