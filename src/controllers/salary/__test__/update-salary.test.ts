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
let users: UserAuth[];
let salary: Salary;

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.manage_salary });
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

  salary = await dataSource.getRepository(Salary).save({
    target_user: users[1].id,
    amount: 5000,
    sales_ratio: 0.1,
    provider_id: provider.id,
    created_by: users[0].id,
  });
});

describe('Update Salary', () => {
  it('should update salary successfully', async () => {
    const response = await request
      .patch(`/api/v1/salaries/${salary.id}`)
      .send({
        amount: 6000,
        sales_ratio: 0.2,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Salary updated successfully');

    const updatedSalary = await dataSource.getRepository(Salary).findOne({
      where: { id: salary.id },
    });
    expect(updatedSalary).toBeTruthy();
    expect(updatedSalary!.amount).toBe(6000);
    expect(updatedSalary!.sales_ratio).toBe(0.2);
  });

  it('should fail to update salary with invalid data', async () => {
    const response = await request
      .patch(`/api/v1/salaries/${salary.id}`)
      .send({
        amount: -100,
        sales_ratio: 1.5,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(422);
  });

  it('should return 403 if user has no permission to update salary', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const response = await request
      .patch(`/api/v1/salaries/${salary.id}`)
      .send({
        amount: 6000,
        sales_ratio: 0.2,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });

  it('should return 404 if salary is not found', async () => {
    const nonExistentSalaryId = '69c7879a-1d88-41c6-8630-d4af6e314e48';
    const response = await request
      .patch(`/api/v1/salaries/${nonExistentSalaryId}`)
      .send({
        amount: 6000,
        sales_ratio: 0.2,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return 404 if salary does not belong to the provider', async () => {
    const response = await request
      .patch(`/api/v1/salaries/${salary.id}`)
      .send({
        amount: 6000,
        sales_ratio: 0.2,
      })
      .set('id', users[1].id);

    expect(response.status).toBe(404);
  });
});
