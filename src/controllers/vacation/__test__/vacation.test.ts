import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { app } from '../../../app';
import { Vacation, DurationType } from '../../../models/vacation.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { Role } from '../../../models/role.model';
import { SystemRoles } from '../../../types/system-roles';
import { Permission } from '../../../models/permission.model';
import { PERMISSIONS } from '../../../types/permissions';
import { RolePermission } from '../../../models/role_permissions.model';
import { UserProfileCompany } from '../../../models/user-profile-company.model';
import { v4 } from 'uuid';

const request = supertest(app);
let users: UserAuth[];

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save([
      { key: PERMISSIONS.create_vacation },
      { key: PERMISSIONS.update_vacation },
      { key: PERMISSIONS.remove_vacation },
      { key: PERMISSIONS.get_vacation },
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

  const companyProfile = await dataSource.getRepository(UserProfileCompany).save({
    first_name: 'first_name',
    last_name: 'last_name',
    middle_name: 'middle_name',
    profile_image: 'profile/image.jpg',
  });

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
      user_company_profile: { id: companyProfile.id },
      account_provider_id: { id: userId },
    },
  ]);
});

describe('Vacation Controller', () => {
  it('should create a vacation successfully', async () => {
    const response = await request
      .post('/api/v1/vacations')
      .send({
        title: 'Vacation Title',
        description: 'Vacation Description',
        vacation_type: 'Annual',
        duration_type: 'yearly',
        max_days: 30,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.title).toBe('Vacation Title');

    const vacation = await dataSource
      .getRepository(Vacation)
      .findOne({ where: { id: response.body.data.id } });
    expect(vacation).toBeDefined();
  });

  it('should get a list of vacations', async () => {
    await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 30,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request.get('/api/v1/vacations').set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].created_by).toBeDefined();
    expect(
      response.body.data[0].created_by.user_company_profile?.profile_image?.startsWith('http'),
    ).toBeTruthy();
  });

  it('should get a single vacation by ID', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 30,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request.get(`/api/v1/vacations/${vacation.id}`).set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(vacation.id);
    expect(response.status).toBe(200);
    expect(response.body.data.created_by).toBeDefined();
    expect(
      response.body.data.created_by.user_company_profile?.profile_image?.startsWith('http'),
    ).toBeTruthy();
  });

  it('should return 404 not found if vacation not exists', async () => {
    const response = await request.get(`/api/v1/vacations/${v4()}`).set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should update a vacation successfully', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 30,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request
      .patch(`/api/v1/vacations/${vacation.id}`)
      .send({
        title: 'Updated Vacation Title',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const updatedVacation = await dataSource
      .getRepository(Vacation)
      .findOne({ where: { id: vacation.id } });
    expect(updatedVacation!.title).toBe('Updated Vacation Title');
  });

  it('should return 404 if update unexists vacation', async () => {
    const response = await request
      .patch(`/api/v1/vacations/${v4()}`)
      .send({
        title: 'Updated Vacation Title',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should delete a vacation successfully', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 30,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request
      .delete(`/api/v1/vacations/${vacation.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const deletedVacation = await dataSource
      .getRepository(Vacation)
      .findOne({ where: { id: vacation.id } });
    expect(deletedVacation).toBeNull();
  });
});

it('should not access vacation if it related to another provider', async () => {
  const tempUserId = v4();
  const anotherUser = await dataSource.getRepository(UserAuth).save({
    id: tempUserId,
    email: 'another_provider@email.com',
    phone: '01234567891',
    user_type: UserType.company,
    role_id: { id: users[0].role_id.id },
    is_verified: true,
    is_verified_by_crm: true,
    account_provider_id: { id: tempUserId },
  });
  const vacation = await dataSource.getRepository(Vacation).save({
    title: 'Vacation Title',
    description: 'Vacation Description',
    vacation_type: 'Annual',
    duration_type: DurationType.yearly,
    max_days: 30,
    created_by: { id: anotherUser.id },
  });

  const response = await request.get(`/api/v1/vacations/${vacation.id}`).set('id', users[0].id);

  expect(response.status).toBe(404);
});

it('should not delete a vacation if it related to another provider', async () => {
  const anotherUser = await dataSource.getRepository(UserAuth).save({
    email: 'another_user@email.com',
    phone: '01234567891',
    user_type: UserType.company,
    role_id: { id: users[0].role_id.id },
    is_verified: true,
    is_verified_by_crm: true,
  });
  const vacation = await dataSource.getRepository(Vacation).save({
    title: 'Vacation Title',
    description: 'Vacation Description',
    vacation_type: 'Annual',
    duration_type: DurationType.yearly,
    max_days: 30,
    provider_id: { id: anotherUser.id },
    created_by: { id: anotherUser.id },
  });

  const response = await request.delete(`/api/v1/vacations/${vacation.id}`).set('id', users[0].id);
  expect(response.status).toBe(404);
});

it('should not update vacation if it related to another provider', async () => {
  const tempUserId = v4();
  await dataSource.getRepository(UserAuth).save({
    id: tempUserId,
    email: 'another_user@email.com',
    phone: '01234567891',
    user_type: UserType.company,
    role_id: { id: users[0].role_id.id },
    is_verified: true,
    is_verified_by_crm: true,
    account_provider_id: { id: tempUserId },
  });
  const vacation = await dataSource.getRepository(Vacation).save({
    title: 'Vacation Title',
    description: 'Vacation Description',
    vacation_type: 'Annual',
    duration_type: DurationType.yearly,
    max_days: 30,
    provider_id: { id: tempUserId },
    created_by: { id: tempUserId },
  });

  const response = await request.patch(`/api/v1/vacations/${vacation.id}`).set('id', users[0].id);
  expect(response.status).toBe(404);
});

it('should not access vacations if user has no permission', async () => {
  await dataSource.getRepository(RolePermission).delete({});
  const response = await request.get('/api/v1/vacations').set('id', users[0].id);
  expect(response.status).toBe(403);
});

it('should return data based on filters', async () => {
  await dataSource.getRepository(Vacation).save([
    {
      title: 'Vacation Title 1',
      description: 'Vacation Description 1',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 30,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    },
    {
      title: 'Vacation Title 2',
      description: 'Vacation Description 2',
      vacation_type: 'sickness',
      duration_type: DurationType.monthly,
      max_days: 15,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    },
  ]);

  const response = await request
    .get('/api/v1/vacations')
    .query({ title: 'Vacation Title 1' })
    .set('id', users[0].id);

  expect(response.status).toBe(200);
  expect(response.body.data.length).toBe(1);
  expect(response.body.data[0].title).toBe('Vacation Title 1');

  const response2 = await request
    .get('/api/v1/vacations')
    .query({ vacation_type: 'sickness' })
    .set('id', users[0].id);

  expect(response2.status).toBe(200);
  expect(response2.body.data.length).toBe(1);
  expect(response2.body.data[0].vacation_type).toBe('sickness');

  const response3 = await request
    .get('/api/v1/vacations')
    .query({ duration_type: 'monthly' })
    .set('id', users[0].id);

  expect(response3.status).toBe(200);
  expect(response3.body.data.length).toBe(1);
  expect(response3.body.data[0].duration_type).toBe('monthly');

  const response4 = await request
    .get('/api/v1/vacations')
    .query({ max_days_from: 10, max_days_to: 20 })
    .set('id', users[0].id);

  expect(response4.status).toBe(200);
  expect(response4.body.data.length).toBe(1);
  expect(response4.body.data[0].max_days).toBe(15);

  const response5 = await request
    .get('/api/v1/vacations')
    .query({ created_at_from: new Date(0), created_at_to: new Date() })
    .set('id', users[0].id);

  expect(response5.status).toBe(200);
  expect(response5.body.data.length).toBe(2);

  const response6 = await request
    .get('/api/v1/vacations')
    .query({ created_by: users[0].id })
    .set('id', users[0].id);

  expect(response6.status).toBe(200);
  expect(response6.body.data.length).toBe(2);

  const response7 = await request
    .get('/api/v1/vacations')
    .query({ created_by: v4() })
    .set('id', users[0].id);

  expect(response7.status).toBe(200);
  expect(response7.body.data.length).toBe(0);
});
