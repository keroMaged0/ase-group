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
import { v4 } from 'uuid';

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

describe('Create salary tests', () => {
  it('should add salary successfully', async () => {
    const response = await request
      .post('/api/v1/salaries')
      .send({
        target_user: users[1].id,
        amount: 5000,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const salary = await dataSource
      .getRepository(Salary)
      .findOne({ where: { target_user: users[1].id } });

    expect(salary).toBeTruthy();
    expect(salary!.target_user).toBe(users[1].id);
    expect(salary!.amount).toBe(5000);
    expect(salary!.created_by).toBe(users[0].id);
    expect(salary!.provider_id).toBe(users[0].account_provider_id.id);
  });

  it('should throw 422 error if validation error', async () => {
    const response = await request.post('/api/v1/salaries').send({}).set('id', users[0].id);

    expect(response.status).toBe(422);
  });

  it('should throw 404 error if employee not found', async () => {
    const id = v4();
    const response = await request
      .post('/api/v1/salaries')
      .send({
        target_user: id,
        amount: 5000,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should throw 400 error if amount is less than 1', async () => {
    const response = await request
      .post('/api/v1/salaries')
      .send({
        target_user: users[1].id,
        amount: 0,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(422);
  });

  it('should throw 400 error if sales_ratio is out of range', async () => {
    const response = await request
      .post('/api/v1/salaries')
      .send({
        target_user: users[1].id,
        amount: 5000,
        sales_ratio: 1.5,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(422);
  });

  it('should add salary with optional sales_ratio', async () => {
    const response = await request
      .post('/api/v1/salaries')
      .send({
        target_user: users[1].id,
        amount: 5000,
        sales_ratio: 0.5,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const salary = await dataSource
      .getRepository(Salary)
      .findOne({ where: { target_user: users[1].id } });

    expect(salary).toBeTruthy();
    expect(salary!.target_user).toBe(users[1].id);
    expect(salary!.amount).toBe(5000);
    expect(salary!.sales_ratio).toBe(0.5);
    expect(salary!.created_by).toBe(users[0].id);
    expect(salary!.provider_id).toBe(users[0].account_provider_id.id);
  });
});



// import { dataSource } from '../../../config/typeorm';
// import { UserAuth, UserType } from '../../../models/user-auth.model';
// import { Salary } from '../../../models/salary.model';
// import { Role } from '../../../models/role.model';
// import { SystemRoles } from '../../../types/system-roles';
// import { Permission } from '../../../models/permission.model';
// import { RolePermission } from '../../../models/role_permissions.model';
// import { PERMISSIONS } from '../../../types/permissions';
// import { v4 } from 'uuid';

// const request = supertest(app);
// let users;
// let permissions;

// beforeEach(async () => {
//   // Set up permissions and roles for the test
//   permissions = await dataSource.getRepository(Permission).save({ key: PERMISSIONS.manage_salary });

//   const roles = await dataSource.getRepository(Role).save(
//     Object.values(SystemRoles).map((role) => ({
//       key: role,
//     })),
//   );

//   await dataSource.getRepository(RolePermission).save(
//     roles.map((role) => ({
//       role_id: { id: role.id },
//       permission_key: { key: permissions.key },
//     })),
//   );

//   const provider = await dataSource.getRepository(UserAuth).save({
//     email: 'company@email.com',
//     phone: '01234567891',
//     role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
//     is_verified: true,
//     is_verified_by_crm: true,
//     user_type: UserType.company,
//   });

//   users = await dataSource.getRepository(UserAuth).save([
//     {
//       email: 'user1@email.com',
//       phone: '01234567891',
//       role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
//       is_verified: true,
//       is_verified_by_crm: true,
//       account_provider_id: provider,
//       user_type: UserType.company,
//     },
//     {
//       email: 'user2@email.com',
//       phone: '01234567891',
//       role_id: { id: roles.find((role) => role.key === SystemRoles.doctor)?.id },
//       is_verified: true,
//       is_verified_by_crm: true,
//       user_type: UserType.doctor,
//     },
//   ]);
// });

// describe('Create salary tests', () => {
//   it('should add salary successfully', async () => {
//     const response = await request
//       .post('/api/v1/salaries')
//       .send({
//         target_user: users[1].id,
//         amount: 5000,
//       })
//       .set('id', users[0].id);

//     expect(response.status).toBe(200);

//     const salary = await dataSource
//       .getRepository(Salary)
//       .findOne({ where: { target_user: users[1].id } });

//     expect(salary).toBeTruthy();
//     expect(salary!.target_user).toBe(users[1].id);
//     expect(salary!.amount).toBe(5000);
//     expect(salary!.created_by).toBe(users[0].id);
//     expect(salary!.provider_id).toBe(users[0].account_provider_id.id);
//   });

//   it('should throw 422 error if validation error', async () => {
//     const response = await request.post('/api/v1/salaries').send({}).set('id', users[0].id);

//     expect(response.status).toBe(422);
//   });

//   it('should throw 404 error if employee not found', async () => {
//     const id = v4();
//     const response = await request
//       .post('/api/v1/salaries')
//       .send({
//         target_user: id,
//         amount: 5000,
//       })
//       .set('id', users[0].id);

//     expect(response.status).toBe(404);
//   });
// });
