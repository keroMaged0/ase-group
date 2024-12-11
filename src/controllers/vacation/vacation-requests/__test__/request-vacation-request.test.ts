import supertest from 'supertest';
import { dataSource } from '../../../../config/typeorm';
import { app } from '../../../../app';
import { Vacation, DurationType } from '../../../../models/vacation.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { Role } from '../../../../models/role.model';
import { SystemRoles } from '../../../../types/system-roles';
import { Permission } from '../../../../models/permission.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { RolePermission } from '../../../../models/role_permissions.model';
import { UserProfileCompany } from '../../../../models/user-profile-company.model';
import { VacationRequest, VacationRequestStatus } from '../../../../models/vacation-request.model';
import { v4 } from 'uuid';

const request = supertest(app);
let users: UserAuth[];

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save([
      { key: PERMISSIONS.request_vacation_request },
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

describe('Vacation Request Controller', () => {
  it('should create a vacation request successfully', async () => {
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
      .post(`/api/v1/vacations/requests/request`)
      .send({
        vacation: vacation.id,
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 5,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.status).toBe(VacationRequestStatus.pending);

    const vacationRequest = await dataSource
      .getRepository(VacationRequest)
      .findOne({ where: { id: response.body.data.id } });
    expect(vacationRequest).toBeDefined();
  });

  it('should return 404 if vacation not found', async () => {
    const response = await request
      .post(`/api/v1/vacations/requests/request`)
      .send({
        vacation: v4(),
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 5,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return 400 if vacation days exceed max allowed days', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 5,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request
      .post(`/api/v1/vacations/requests/request`)
      .send({
        vacation: vacation.id,
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 10,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(400);
  });

  it('should return 403 if user has no permission to create vacation request', async () => {
    await dataSource.getRepository(RolePermission).delete({});
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
      .post(`/api/v1/vacations/requests/request`)
      .send({
        vacation: vacation.id,
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 5,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
