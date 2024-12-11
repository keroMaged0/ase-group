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
import {
  VacationRequest,
  VacationRequestStatus,
  VacationRequestType,
} from '../../../../models/vacation-request.model';
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

describe('Retrieve Rest Vacation Days Controller', () => {
  it('should retrieve remaining vacation days successfully', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 30,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    await dataSource.getRepository(VacationRequest).save({
      vacation_id: { id: vacation.id },
      target_user: { id: users[0].id },
      start_date: new Date(),
      end_date: new Date(),
      real_vacation_days: 5,
      status: VacationRequestStatus.approved,
      request_type: VacationRequestType.order,
    });

    const response = await request
      .post('/api/v1/vacations/requests/retreive')
      .send({
        vacation: vacation.id,
        user_id: users[0].id,
        date: new Date(),
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data.total_vacation_days).toBe(30);
    expect(response.body.data.remaining_days).toBe(25);
  });

  it('should return 404 if vacation not found', async () => {
    const response = await request
      .post('/api/v1/vacations/requests/retreive')
      .send({
        vacation: v4(),
        user_id: users[0].id,
        date: new Date(),
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return 0 remaining days if no vacation requests found', async () => {
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
      .post('/api/v1/vacations/requests/retreive')
      .send({
        vacation: vacation.id,
        user_id: users[0].id,
        date: new Date(),
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data.total_vacation_days).toBe(30);
    expect(response.body.data.remaining_days).toBe(30);
  });

  it('should return remaining days correctly for monthly duration type', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.monthly,
      max_days: 5,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    await dataSource.getRepository(VacationRequest).save({
      vacation_id: { id: vacation.id },
      target_user: { id: users[0].id },
      start_date: new Date(),
      end_date: new Date(),
      real_vacation_days: 2,
      status: VacationRequestStatus.approved,
      request_type: VacationRequestType.order,
    });

    const response = await request
      .post('/api/v1/vacations/requests/retreive')
      .send({
        vacation: vacation.id,
        user_id: users[0].id,
        date: new Date(),
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data.total_vacation_days).toBe(5);
    expect(response.body.data.remaining_days).toBe(3);
  });
});
