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


describe('Punishment Requests Controller', () => {
    it('should get a list of punishment requests', async () => {
      await dataSource.getRepository(PunishmentRequest).save([
        {
          target_user: { id: users[0].id },
          created_by: { id: users[0].id },
          provider_id: { id: users[0].id },
        },
      ]);
  
      const response = await request.get('/api/v1/punishments/requests').set('id', users[0].id);
  
      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  
    it('should get a single punishment request by ID', async () => {
      const punishmentRequest = await dataSource.getRepository(PunishmentRequest).save({
        target_user: { id: users[0].id },
        created_by: { id: users[0].id },
        provider_id: { id: users[0].id },
      });
  
      const response = await request
        .get(`/api/v1/punishments/requests/${punishmentRequest.id}`)
        .set('id', users[0].id);
  
      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBe(punishmentRequest.id);
    });
  
    it('should return 404 not found if punishment request does not exist', async () => {
      const response = await request.get(`/api/v1/punishments/requests/${v4()}`).set('id', users[0].id);
  
      expect(response.status).toBe(404);
    });
    });