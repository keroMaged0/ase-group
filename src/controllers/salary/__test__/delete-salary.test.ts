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
beforeEach(async () => {
  // Set up permissions and roles for the test
  permissions = await dataSource.getRepository(Permission).save({ key: PERMISSIONS.manage_salary });

  const roles = await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );

  await dataSource.getRepository(RolePermission).save(
    roles.map((role) => ({
      role_id: { id: role.id },
      permission_key: { key: permissions.key },
    })),
  );

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
  ]);
});

describe('Delete salary test', () => {
  it('should delete salary successfully', async () => {
    const createSalaryResponse = await request
      .post('/api/v1/salaries')
      .send({ target_user: users[1].id, amount: 5000 })
      .set('id', users[0].id);
    const salaryId = createSalaryResponse.body.data.id;
    const response = await request.delete(`/api/v1/salaries/${salaryId}`).set('id', users[0].id);
    expect(response.status).toBe(200);
  });

  it('should throw 404 error if the provider is different', async () => {
    const createSalaryResponse = await request
      .post('/api/v1/salaries')
      .send({ target_user: users[1].id, amount: 5000 })
      .set('id', users[0].id);
    const salaryId = createSalaryResponse.body.data.id;
    const response = await request.delete(`/api/v1/salaries/${salaryId}`).set('id', users[1].id);
    expect(response.status).toBe(404);
  });

  it('should throw 404 error if not found', async () => {
    const salaryId = 'dab586ee-d098-43fb-9421-7f5dca96b181';
    const response = await request.delete(`/api/v1/salaries/${salaryId}`).set('id', users[0].id);
    expect(response.status).toBe(404);
  });

  it('should throw 422 error if id not valid', async () => {
    const salaryId = 'dab586ee-d098-43fb-9421-7f5dca96b18';
    const response = await request.delete(`/api/v1/salaries/${salaryId}`).set('id', users[0].id);
    expect(response.status).toBe(422);
  });

  it('should return 403 if user has no permission to delete salary', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const createSalaryResponse = await request
      .post('/api/v1/salaries')
      .send({ target_user: users[1].id, amount: 5000 })
      .set('id', users[0].id);
    const salaryId = createSalaryResponse.body.data.id;
    const response = await request.delete(`/api/v1/salaries/${salaryId}`).set('id', users[0].id);
    expect(response.status).toBe(403);
  });

  it('should return 400 if salary is already deleted', async () => {
    const createSalaryResponse = await request
      .post('/api/v1/salaries')
      .send({ target_user: users[1].id, amount: 5000 })
      .set('id', users[0].id);
    const salaryId = createSalaryResponse.body.data.id;
    await request.delete(`/api/v1/salaries/${salaryId}`).set('id', users[0].id);
    const response = await request.delete(`/api/v1/salaries/${salaryId}`).set('id', users[0].id);
    expect(response.status).toBe(404);
  });
});


 