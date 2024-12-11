import supertest from 'supertest';
import { v4 } from 'uuid';
import { app } from '../../../../app';
import { dataSource } from '../../../../config/typeorm';
import { UserAuth } from '../../../../models/user-auth.model';
import {
  VacationRequest,
  VacationRequestStatus,
  VacationRequestType,
} from '../../../../models/vacation-request.model';
import { Vacation } from '../../../../models/vacation.model';
import { Permission } from '../../../../models/permission.model';
import { Role } from '../../../../models/role.model';
import { UserProfileCompany } from '../../../../models/user-profile-company.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { UserType } from '../../../../models/user-auth.model';
import { DurationType } from '../../../../models/vacation.model';
import { RolePermission } from '../../../../models/role_permissions.model';
import { SystemRoles } from '../../../../types/system-roles';

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

describe('Get One Vacation Request Controller', () => {
  it('should get a single vacation request by ID', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 30,
      created_by: { id: users[0].id },
      provider_id: { id: users[0].id },
    });

    const vacationRequest = await dataSource.getRepository(VacationRequest).save({
      start_date: new Date(),
      end_date: new Date(),
      real_vacation_days: 5,
      status: VacationRequestStatus.pending,
      request_type: VacationRequestType.order,
      target_user: { id: users[0].id },
      created_by: { id: users[0].id },
      vacation: { id: vacation.id },
    });

    const response = await request
      .get(`/api/v1/vacations/requests/${vacationRequest.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(vacationRequest.id);
    expect(response.body.data.created_by).toBeDefined();
    expect(response.body.data.target_user).toBeDefined();
  });

  it('should return 404 not found if vacation request does not exist', async () => {
    const response = await request.get(`/api/v1/vacations/requests/${v4()}`).set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return 403 if user has no permission', async () => {
    await dataSource.getRepository(RolePermission).delete({});
    const response = await request.get(`/api/v1/vacations/requests/${v4()}`).set('id', users[0].id);

    expect(response.status).toBe(403);
  });

  it('should not access vacation request if it is related to another provider', async () => {
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
      provider_id: { id: anotherUser.id },
    });

    const vacationRequest = await dataSource.getRepository(VacationRequest).save({
      start_date: new Date(),
      end_date: new Date(),
      real_vacation_days: 5,
      status: VacationRequestStatus.pending,
      request_type: VacationRequestType.order,
      target_user: { id: anotherUser.id },
      created_by: { id: anotherUser.id },
      provider_id: { id: anotherUser.id },
      vacation: { id: vacation.id },
    });

    const response = await request
      .get(`/api/v1/vacations/requests/${vacationRequest.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });
});
