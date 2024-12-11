import supertest from 'supertest';
import { v4 } from 'uuid';
import { dataSource } from '../../../../config/typeorm';
import { Punishment } from '../../../../models/punishments.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { app } from '../../../../app';
import { Permission } from '../../../../models/permission.model';
import { Role } from '../../../../models/role.model';
import { RolePermission } from '../../../../models/role_permissions.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { SystemRoles } from '../../../../types/system-roles';
import { PunishmentRequest } from '../../../../models/punishment-request.model';


const request = supertest(app);
let users: UserAuth[];

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save([
      { key: PERMISSIONS.give_punishment_request },
      { key: PERMISSIONS.remove_punishment_request },
      { key: PERMISSIONS.get_punishment_request },
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

describe('Get One Punishment Request Controller', () => {
    it('should get a single punishment request by ID', async () => {
      const punishment = await dataSource.getRepository(Punishment).save({
        title: 'Punishment Title',
        description: 'Punishment Description',
        punishment_type: 'Salary Deduction',
        deduction: 50,
        created_by: { id: users[0].id },
        provider_id: { id: users[0].id },
      });
      console.log('Saved punishment:', punishment);
  
      const punishmentRequest = await dataSource.getRepository(PunishmentRequest).save({
        created_by: { id: users[0].id },
        target_user: { id: users[0].id },
        punishment: { id: punishment.id },
      });
      console.log('Saved punishmentRequest:', punishmentRequest);
  
      const response = await request
        .get(`/api/v1/punishments/requests/${punishmentRequest.id}`)
        .set('id', users[0].id);

        console.log('Response body:', response.body);
  
      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBe(punishmentRequest.id);
      expect(response.body.data[0].created_by).toBeDefined();
      expect(response.body.data[0].target_user).toBeDefined();
    });
  });

  it('should return 404 if punishment request does not exist', async () => {
    const response = await request.get(`/api/v1/punishments/requests/${v4()}`).set('id', users[0].id);
  
    expect(response.status).toBe(404);
  });

  it('should return 403 if user has no permission', async () => {
    await dataSource.getRepository(RolePermission).delete({});
    const response = await request.get(`/api/v1/punishments/requests/${v4()}`).set('id', users[0].id);
  
    expect(response.status).toBe(403);
  });

  it('should not access punishment request if it is related to another provider', async () => {
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
      deduction: 50,
      provider_id: { id: anotherUser.id },
    });
  
    const punishmentRequest = await dataSource.getRepository(PunishmentRequest).save({
      created_by: { id: anotherUser.id },
      target_user: { id: anotherUser.id },
      provider_id: { id: anotherUser.id },
      punishment: { id: punishment.id },
    });
  
    const response = await request
      .get(`/api/v1/punishments/requests/${punishmentRequest.id}`)
      .set('id', users[0].id);
  
    expect(response.status).toBe(404);
  });
  