import supertest from 'supertest';
import { v4 } from 'uuid';
import { dataSource } from '../../../../config/typeorm';
import { Permission } from '../../../../models/permission.model';
import { Role } from '../../../../models/role.model';
import { RolePermission } from '../../../../models/role_permissions.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { UserProfileCompany } from '../../../../models/user-profile-company.model';
import {
  VacationRequest,
  VacationRequestStatus,
  VacationRequestType,
} from '../../../../models/vacation-request.model';
import { Vacation, DurationType } from '../../../../models/vacation.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { SystemRoles } from '../../../../types/system-roles';
import { app } from '../../../../app';

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
      { key: PERMISSIONS.retreive_rest_vacation_days },
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

describe('Update Vacation Request Controller', () => {
  it('should update a vacation request successfully', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 30,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const vacationRequest = await dataSource.getRepository(VacationRequest).save({
      vacation: { id: vacation.id },
      status: VacationRequestStatus.pending,
      request_type: VacationRequestType.gift,
      start_date: new Date(),
      end_date: new Date(),
    });

    const response = await request
      .patch(`/api/v1/vacations/requests/${vacationRequest.id}`)
      .send({
        status: 'approved',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const updatedVacationRequest = await dataSource
      .getRepository(VacationRequest)
      .findOne({ where: { id: vacationRequest.id } });
    expect(updatedVacationRequest!.status).toBe(VacationRequestStatus.approved);
  });

  it('should return 404 if vacation request does not exist', async () => {
    const response = await request
      .patch(`/api/v1/vacations/requests/${v4()}`)
      .send({
        status: 'approved',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return 400 if vacation request status is already updated', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 30,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const vacationRequest = await dataSource.getRepository(VacationRequest).save({
      vacation: { id: vacation.id },
      status: VacationRequestStatus.approved,
      request_type: VacationRequestType.gift,
      start_date: new Date(),
      end_date: new Date(),
    });

    const response = await request
      .patch(`/api/v1/vacations/requests/${vacationRequest.id}`)
      .send({
        status: 'rejected',
        rejection_reason: 'Vacation Request Rejected',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(400);
  });

  it('should return 403 if user has no permission to update vacation request', async () => {
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

    const vacationRequest = await dataSource.getRepository(VacationRequest).save({
      vacation: { id: vacation.id },
      status: VacationRequestStatus.pending,
      request_type: VacationRequestType.gift,
      start_date: new Date(),
      end_date: new Date(),
    });

    const response = await request
      .patch(`/api/v1/vacations/requests/${vacationRequest.id}`)
      .send({
        status: VacationRequestStatus.approved,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
