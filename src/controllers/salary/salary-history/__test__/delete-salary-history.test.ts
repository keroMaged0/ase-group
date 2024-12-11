import supertest from 'supertest';
import { app } from '../../../../app';
import { dataSource } from '../../../../config/typeorm';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { SalaryHistory } from '../../../../models/salary-history.model';
import { Role } from '../../../../models/role.model';
import { SystemRoles } from '../../../../types/system-roles';
import { Permission } from '../../../../models/permission.model';
import { RolePermission } from '../../../../models/role_permissions.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { v4 } from 'uuid';
import { Salary } from '../../../../models/salary.model';
const request = supertest(app);
let users: UserAuth[];
let salaryHistory: SalaryHistory;

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save([{ key: PERMISSIONS.manage_salary_history }]);

  const roles = await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );

  await dataSource.getRepository(RolePermission).save(
    roles.map((role) => ({
      role_id: { id: role.id },
      permission_key: { key: permissions[0].key },
    })),
  );

  const provider = await dataSource.getRepository(UserAuth).save({
    email: 'provider@example.com',
    phone: '01234567891',
    user_type: UserType.company,
    role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
    is_verified: true,
    is_verified_by_crm: true,
  });

  users = await dataSource.getRepository(UserAuth).save([
    {
      email: 'user1@example.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      account_provider_id: provider,
    },
    {
      email: 'user2@example.com',
      phone: '01234567891',
      user_type: UserType.doctor,
      role_id: { id: roles.find((role) => role.key === SystemRoles.doctor)?.id },
      is_verified: true,
      is_verified_by_crm: true,
    },
  ]);

  const salary = await dataSource.getRepository(Salary).save({
    amount: 5000,
    sales_ratio: 0.1,
    target_user: users[1].id,
    created_by: users[0].id,
    provider_id: provider.id,
  });

  salaryHistory = await dataSource.getRepository(SalaryHistory).save({
    real_salary: 5000,
    commissions: 500,
    salary: { id: salary.id },
    provider_id: provider.id,
    is_received: false,
  });
});

describe('Delete Salary History', () => {
  it('should delete salary history successfully', async () => {
    const response = await request
      .delete(`/api/v1/salaries/history/${salaryHistory.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Salary history updated successfully');

    const deletedSalaryHistory = await dataSource.getRepository(SalaryHistory).findOne({
      where: { id: salaryHistory.id },
    });
    expect(deletedSalaryHistory).toBeNull();
  });

  it('should return 404 if salary history not found', async () => {
    const nonExistentSalaryHistoryId = v4();
    const response = await request
      .delete(`/api/v1/salaries/history/${nonExistentSalaryHistoryId}`)
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return 404 if salary history does not belong to the provider', async () => {
    const response = await request
      .delete(`/api/v1/salaries/history/${salaryHistory.id}`)
      .set('id', users[1].id);

    expect(response.status).toBe(404);
  });

  it('should return 422 if id is not valid', async () => {
    const invalidId = 'invalid-id';
    const response = await request
      .delete(`/api/v1/salaries/history/${invalidId}`)
      .set('id', users[0].id);

    expect(response.status).toBe(422);
  });

  it('should return 403 if user has no permission to delete salary history', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const response = await request
      .delete(`/api/v1/salaries/history/${salaryHistory.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });

  it('should return 500 if there is a server error', async () => {
    jest.spyOn(dataSource.getRepository(SalaryHistory), 'delete').mockImplementation(() => {
      throw new Error('Server error');
    });

    const response = await request
      .delete(`/api/v1/salaries/history/${salaryHistory.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(500);
  });
});
