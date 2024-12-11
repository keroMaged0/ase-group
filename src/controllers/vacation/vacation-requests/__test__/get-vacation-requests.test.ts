import supertest from 'supertest';
import { v4 } from 'uuid';
import { dataSource } from '../../../../config/typeorm';
import { Role } from '../../../../models/role.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { UserProfileCompany } from '../../../../models/user-profile-company.model';
import {
  VacationRequest,
  VacationRequestStatus,
  VacationRequestType,
} from '../../../../models/vacation-request.model';
import { SystemRoles } from '../../../../types/system-roles';
import { app } from '../../../../app';
import { Permission } from '../../../../models/permission.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { RolePermission } from '../../../../models/role_permissions.model';

const request = supertest(app);
let users: UserAuth[];

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save([
      { key: PERMISSIONS.request_vacation_request },
      { key: PERMISSIONS.gift_vacation_request },
      { key: PERMISSIONS.update_vacation_request },
      { key: PERMISSIONS.remove_vacation_request },
      { key: PERMISSIONS.get_vacation_request },
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

describe('Vacation Requests Controller', () => {
  it('should get a list of vacation requests', async () => {
    await dataSource.getRepository(VacationRequest).save([
      {
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 5,
        status: VacationRequestStatus.pending,
        request_type: VacationRequestType.order,
        target_user: { id: users[0].id },
        created_by: { id: users[0].id },
        provider_id: { id: users[0].id },
      },
    ]);

    const response = await request.get('/api/v1/vacations/requests').set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].created_by).toBeDefined();
  });

  it('should get a single vacation request by ID', async () => {
    const vacationRequest = await dataSource.getRepository(VacationRequest).save({
      start_date: new Date(),
      end_date: new Date(),
      real_vacation_days: 5,
      status: VacationRequestStatus.pending,
      request_type: VacationRequestType.order,
      target_user: { id: users[0].id },
      created_by: { id: users[0].id },
      provider_id: { id: users[0].id },
    });

    const response = await request
      .get(`/api/v1/vacations/requests/${vacationRequest.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(vacationRequest.id);
    expect(response.body.data.created_by).toBeDefined();
  });

  it('should return 404 not found if vacation request does not exist', async () => {
    const response = await request.get(`/api/v1/vacations/requests/${v4()}`).set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return data based on filters', async () => {
    await dataSource.getRepository(VacationRequest).save([
      {
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 5,
        status: VacationRequestStatus.pending,
        request_type: VacationRequestType.order,
        target_user: { id: users[0].id },
        created_by: { id: users[0].id },
        provider_id: { id: users[0].id },
      },
      {
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 10,
        status: VacationRequestStatus.approved,
        request_type: VacationRequestType.gift,
        target_user: { id: users[0].id },
        created_by: { id: users[0].id },
        provider_id: { id: users[0].id },
      },
    ]);

    const response = await request
      .get('/api/v1/vacations/requests')
      .query({ status: 'pending' })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].status).toBe('pending');

    const response2 = await request
      .get('/api/v1/vacations/requests')
      .query({ type: 'gift' })
      .set('id', users[0].id);

    expect(response2.status).toBe(200);
    expect(response2.body.data.length).toBe(1);
    expect(response2.body.data[0].request_type).toBe('gift');
  });
});
