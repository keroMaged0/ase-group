import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { Task } from '../../../models/task.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { app } from '../../../app';
import { PERMISSIONS } from '../../../types/permissions';
import { Role } from '../../../models/role.model';
import { RolePermission } from '../../../models/role_permissions.model';
import { SystemRoles } from '../../../types/system-roles';
import { Permission } from '../../../models/permission.model';

const request = supertest(app);
let users: UserAuth[];

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.create_task });
  const roles = await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );
  await dataSource
    .getRepository(RolePermission)
    .save(
      roles.map((role) => ({ role_id: { id: role.id }, permission_key: { key: permissions.key } })),
    );

    const provider = await dataSource.getRepository(UserAuth).save(  {
      email: 'user@example.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
    },
  )

  users = await dataSource.getRepository(UserAuth).save([
    {
      email: 'user1@example.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.admin)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      account_provider_id: provider,
    },
    {
      email: 'user2@example.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      account_provider_id:provider
    },
  ]);
});

describe('Create Task', () => {
  it('should create task successfully', async () => {
    const response = await request
      .post('/api/v1/tasks')
      .send({
        description: 'Test Task',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        target_user: users[0].id,
      })
      .set('id', users[1].id);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Task created successfully');

    const task = await dataSource.getRepository(Task).findOne({
      where: { description: 'Test Task' },
    });
    expect(task).toBeTruthy();
    expect(task!.description).toBe('Test Task');
  });

  it('should fail to create task with invalid data', async () => {
    const response = await request
      .post('/api/v1/tasks')
      .send({
        description: '',
        start_at: 'invalid-date',
        end_at: 'invalid-date',
        target_user: 'invalid-uuid',
      })
      .set('id', users[1].id);

    expect(response.status).toBe(422);
  });

  it('should return 403 if user has no permission to create task', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const response = await request
      .post('/api/v1/tasks')
      .send({
        description: 'Test Task',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        target_user: users[0].id,
      })
      .set('id', users[1].id);

    expect(response.status).toBe(403);
  });

  it('should handle errors during task creation', async () => {
    jest
      .spyOn(dataSource.getRepository(Task), 'save')
      .mockRejectedValueOnce(new Error('Test Error'));

    const response = await request
      .post('/api/v1/tasks')
      .send({
        description: 'Test Task',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        target_user: users[0].id,
      })
      .set('id', users[1].id);

    expect(response.status).toBe(500);
  });
});
