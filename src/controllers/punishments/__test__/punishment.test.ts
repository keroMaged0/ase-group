import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { app } from '../../../app';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { Role } from '../../../models/role.model';
import { SystemRoles } from '../../../types/system-roles';
import { Permission } from '../../../models/permission.model';
import { RolePermission } from '../../../models/role_permissions.model';
import { v4 } from 'uuid';
import { PERMISSIONS } from '../../../types/permissions';
import { UserProfileCompany } from '../../../models/user-profile-company.model';
import { Punishment } from '../../../models/punishments.model';

const request = supertest(app);
let users: UserAuth[];

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save([
      { key: PERMISSIONS.create_punishment },
      { key: PERMISSIONS.update_punishment },
      { key: PERMISSIONS.remove_punishment },
      { key: PERMISSIONS.get_punishment },
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

describe('Punishment Controller', () => {
  it('should create a punishment successfully', async () => {
    const response = await request
      .post('/api/v1/punishments')
      .send({
        title: 'Punishment Title',
        description: 'Punishment Description',
        punishment_type: 'Salary Deduction',
        deduction: 100,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.title).toBe('Punishment Title');

    const punishment = await dataSource
      .getRepository(Punishment)
      .findOne({ where: { id: response.body.data.id } });

    expect(punishment).toBeDefined();
  });

  it('should get a list of punishments', async () => {
    await dataSource.getRepository(Punishment).save({
      title: 'Punishment Title',
      description: 'Punishment Description',
      punishment_type: 'Salary Deduction',
      deduction: 100,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request.get('/api/v1/punishments').set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
  });
  });

  it('should get a single punishment by ID', async () => {
    const punishment = await dataSource.getRepository(Punishment).save({
      title: 'Punishment Title',
      description: 'Punishment Description',
      punishment_type: 'Salary Deduction',
      deduction: 100,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request.get(`/api/v1/punishments/${punishment.id}`).set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(punishment.id);
    expect(response.status).toBe(200);
  }); 

  it('should return 404 not found if punishment does not exist', async () => {
    const response = await request.get(`/api/v1/punishments/${v4()}`).set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should update a punishment successfully', async () => {
    const punishment = await dataSource.getRepository(Punishment).save({
      title: 'Punishment Title',
      description: 'Punishment Description',
      punishment_type: 'Salary Deduction',
      deduction: 100,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request
      .patch(`/api/v1/punishments/${punishment.id}`)
      .send({
        title: 'Updated Punishment Title',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const updatedPunishment = await dataSource
      .getRepository(Punishment)
      .findOne({ where: { id: punishment.id } });
    expect(updatedPunishment!.title).toBe('Updated Punishment Title');
  });

  it('should return 404 if update unexists punishment', async () => {
    const response = await request
      .patch(`/api/v1/punishments/${v4()}`)
      .send({
        title: 'Updated Punishment Title',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should delete a punishment successfully', async () => {
    const punishment = await dataSource.getRepository(Punishment).save({
      title: 'Punishment Title',
      description: 'Punishment Description',
      punishment_type: 'Salary Deduction',
      deduction: 100,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request
      .delete(`/api/v1/punishments/${punishment.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const deletedPunishment = await dataSource
      .getRepository(Punishment)
      .findOne({ where: { id: punishment.id } });

    expect(deletedPunishment).toBeNull();
  });

  it('should not access punishment if it related to another provider', async () => {
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

    const punishment = await dataSource.getRepository(Punishment).save({
      title: 'Punishment Title',
      description: 'Punishment Description',
      punishment_type: 'Salary Deduction',
      deduction: 100,
      created_by: { id: anotherUser.id },
    });

    const response = await request.get(`/api/v1/punishments/${punishment.id}`).set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should not update punishment if it related to another provider', async () => {
    const tempUserId = v4();
    const anotherUser = await dataSource.getRepository(UserAuth).save({
      id: tempUserId,
      email: 'another_user@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: users[0].role_id.id },
      is_verified: true,
      is_verified_by_crm: true,
      account_provider_id: { id: tempUserId },
    });

    const punishment = await dataSource.getRepository(Punishment).save({
      title: 'Punishment Title',
      description: 'Punishment Description',
      punishment_type: 'Salary Deduction',
      deduction: 100,
      provider_id: { id: tempUserId },
      created_by: { id: tempUserId },
    });

    const response = await request.patch(`/api/v1/punishments/${punishment.id}`).set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should not delete punishment if it related to another provider', async () => {
    const tempUserId = v4();
    const anotherUser = await dataSource.getRepository(UserAuth).save({
      id: tempUserId,
      email: 'another_user@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: users[0].role_id.id },
      is_verified: true,
      is_verified_by_crm: true,
    });

    const punishment = await dataSource.getRepository(Punishment).save({
      title: 'Punishment Title',
      description: 'Punishment Description',
      punishment_type: 'Salary Deduction',
      deduction: 100,
      provider_id: { id: anotherUser.id },
      created_by: { id: anotherUser.id },
    });

    const response = await request.delete(`/api/v1/punishments/${punishment.id}`).set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return data based on filters', async () => {
    await dataSource.getRepository(Punishment).save([
      {
        title: 'Punishment Title 1',
        description: 'Punishment Description 1',
        punishment_type: 'Salary Deduction',
        deduction: 100,
        provider_id: { id: users[0].id },
        created_by: { id: users[0].id },
      },
      {
        title: 'Punishment Title 2',
        description: 'Punishment Description 2',
        punishment_type: 'Warning',
        deduction: null,
        provider_id: { id: users[0].id },
        created_by: { id: users[0].id },
      },
    ]);

    const response1 = await request
      .get('/api/v1/punishments')
      .query({ title: 'Punishment Title 1' })
      .set('id', users[0].id);
  
    expect(response1.status).toBe(200);
    expect(response1.body.data.length).toBe(1);
    expect(response1.body.data[0].title).toBe('Punishment Title 1');

    const response2 = await request
      .get('/api/v1/punishments')
      .query({ punishment_type: 'Warning' })
      .set('id', users[0].id);
  
    expect(response2.status).toBe(200);
    expect(response2.body.data.length).toBe(1);
    expect(response2.body.data[0].punishment_type).toBe('Warning');

    const response4 = await request
      .get('/api/v1/punishments')
      .query({ created_at_from: new Date(0), created_at_to: new Date() })
      .set('id', users[0].id);
  
    expect(response4.status).toBe(200);
    expect(response4.body.data.length).toBe(2);

    const response5 = await request
      .get('/api/v1/punishments')
      .query({ created_by: users[0].id })
      .set('id', users[0].id);
  
    expect(response5.status).toBe(200);
    expect(response5.body.data.length).toBe(2);
  
    const response6 = await request
      .get('/api/v1/punishments')
      .query({ created_by: v4() })
      .set('id', users[0].id);
  
    expect(response6.status).toBe(200);
    expect(response6.body.data.length).toBe(0);
  });
  
