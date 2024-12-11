import supertest from 'supertest';
import { v4 } from 'uuid';
import { dataSource } from '../../../../config/typeorm';
import { Permission } from '../../../../models/permission.model';
import { Role } from '../../../../models/role.model';
import { RolePermission } from '../../../../models/role_permissions.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import {
  VacationRequestType,
  VacationRequest,
  VacationRequestStatus,
} from '../../../../models/vacation-request.model';
import { Vacation, DurationType } from '../../../../models/vacation.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { SystemRoles } from '../../../../types/system-roles';
import { app } from '../../../../app';

const request = supertest(app);
let users: UserAuth[];

app.set('socket', {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
});

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

describe('Gift Vacation Request Controller', () => {
  it('should create a gift vacation request successfully', async () => {
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
      .post(`/api/v1/vacations/requests/gift`)
      .send({
        vacation: vacation.id,
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 5,
        target_user: users[0].id,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.request_type).toBe(VacationRequestType.gift);

    const vacationRequest = await dataSource
      .getRepository(VacationRequest)
      .findOne({ where: { id: response.body.data.id } });
    expect(vacationRequest).toBeDefined();
  });

  it('should return 404 if vacation not found', async () => {
    const response = await request
      .post(`/api/v1/vacations/requests/gift`)
      .send({
        vacation: v4(),
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 5,
        target_user: users[0].id,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

  it('should return 400 if total real vacation days exceed max days', async () => {
    const vacation = await dataSource.getRepository(Vacation).save({
      title: 'Vacation Title',
      description: 'Vacation Description',
      vacation_type: 'Annual',
      duration_type: DurationType.yearly,
      max_days: 10,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    await dataSource.getRepository(VacationRequest).save({
      start_date: new Date(),
      end_date: new Date(),
      real_vacation_days: 8,
      target_user: { id: users[0].id },
      vacation: { id: vacation.id },
      status: VacationRequestStatus.approved,
      created_by: { id: users[0].id },
      provider_id: { id: users[0].id },
      request_type: VacationRequestType.gift,
    });

    const response = await request
      .post(`/api/v1/vacations/requests/gift`)
      .send({
        vacation: vacation.id,
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 5,
        target_user: users[0].id,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(400);
  });

  it('should return 403 if user has no permission', async () => {
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
      .post(`/api/v1/vacations/requests/gift`)
      .send({
        start_date: new Date(),
        end_date: new Date(),
        real_vacation_days: 5,
        target_user: users[0].id,
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
