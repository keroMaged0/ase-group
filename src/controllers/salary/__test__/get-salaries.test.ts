import supertest from 'supertest';
import { app } from '../../../app';
import { dataSource } from '../../../config/typeorm';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { Salary } from '../../../models/salary.model';
import { Role } from '../../../models/role.model';
import { SystemRoles } from '../../../types/system-roles';
import { Permission } from '../../../models/permission.model';
import { RolePermission } from '../../../models/role_permissions.model';
import { PERMISSIONS } from '../../../types/permissions';

const request = supertest(app);
let users;
let permissions;
let salaries;
beforeEach(async () => {
  // Set up permissions and roles for the test
  permissions = await dataSource
    .getRepository(Permission)
    .save([{ key: PERMISSIONS.manage_salary }, { key: PERMISSIONS.receive_salary }]);

  const roles = await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );

  let rolePermisions: any[] = [];

  for (let role of roles) {
    for (let per of permissions) {
      rolePermisions.push({ role_id: role.id, permission_key: per.key });
    }
  }

  await dataSource.getRepository(RolePermission).save(rolePermisions);

  const provider = await dataSource.getRepository(UserAuth).save({
    email: 'company@email.com',
    phone: '01234567891',
    role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
    is_verified: true,
    is_verified_by_crm: true,
    user_type: UserType.company,
  });

  users = await dataSource.getRepository(UserAuth).save([
    {
      email: 'user1@email.com',
      phone: '01234567891',
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      account_provider_id: provider,
      user_type: UserType.company,
    },
    {
      email: 'user2@email.com',
      phone: '01234567891',
      role_id: { id: roles.find((role) => role.key === SystemRoles.doctor)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      user_type: UserType.doctor,
    },
    {
      email: 'user3@email.com',
      phone: '01234567891',
      role_id: { id: roles.find((role) => role.key === SystemRoles.doctor)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      user_type: UserType.doctor,
    },
  ]);

  salaries = await dataSource.getRepository(Salary).save([
    {
      amount: 1000,
      provider_id: provider.id,
      created_by: users[0].id,
      target_user: users[1].id,
    },
    {
      amount: 2000,
      provider_id: provider.id,
      created_by: users[0].id,
      target_user: users[2].id,
    },
  ]);
});

describe('Get Salaries', () => {
  it('should return salaries successfully', async () => {
    const response = await request.get('/api/v1/salaries').set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty('id');
    expect(response.body.data[0]).toHaveProperty('amount');
    expect(response.body.data[0].target_user).toHaveProperty('id');
    expect(response.body.data[0].created_by).toHaveProperty('id');
  });

  it('should return salaries successfully with pagination', async () => {
    const response = await request.get('/api/v1/salaries?page=1&limit=2').set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination.currentPage).toBe(1);
    expect(response.body.pagination.resultCount).toBe(2);
    expect(response.body.pagination.totalPages).toBe(1);
  });

  it('should return no salaries', async () => {
    const response = await request.get('/api/v1/salaries').set('id', users[2].id);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });



  it('should return 403 if user has no permission to view salaries', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const response = await request.get('/api/v1/salaries').set('id', users[0].id);

    expect(response.status).toBe(403);
  });


});

 