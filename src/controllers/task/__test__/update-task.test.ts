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
import { TASK_STATUS } from '../../../types/task-status';

const request = supertest(app);
let users: UserAuth[];
let task: Task;

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.update_task });
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

    const provider = await dataSource.getRepository(UserAuth).save({
      email: 'user0@example.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,   
    })

  users = await dataSource.getRepository(UserAuth).save([
    {
      email: 'user1@example.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      account_provider_id: provider,
    },
  ]);

  task = await dataSource.getRepository(Task).save({
    description: 'Test Task',
    start_at: new Date(),
    end_at: new Date(Date.now() + 3600000), // 1 hour later
    target_user: users[0].id,
    provider_id: provider.id,
    created_by: users[0].id,
    status: TASK_STATUS.pending,
  });
});

describe('Update Task', () => {
  it('should update task successfully', async () => {
    const response = await request
      .patch(`/api/v1/tasks/${task.id}`)
      .send({
        description: 'Updated Test Task',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours later
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Task updated successfully');

    const updatedTask = await dataSource.getRepository(Task).findOne({
      where: { id: task.id },
    });
    expect(updatedTask).toBeTruthy();
    expect(updatedTask!.description).toBe('Updated Test Task');
  });

  it('should fail to update task with invalid data', async () => {
    const response = await request
      .patch(`/api/v1/tasks/${task.id}`)
      .send({
        description: '',
        start_at: 'invalid-date',
        end_at: 'invalid-date',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(422);
  });

  it('should return 403 if user has no permission to update task', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const response = await request
      .patch(`/api/v1/tasks/${task.id}`)
      .send({
        description: 'Updated Test Task',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours later
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });

  it('should return 404 if task is not found', async () => {
    const nonExistentTaskId = '69c7879a-1d88-41c6-8630-d4af6e314e48';
    const response = await request
      .patch(`/api/v1/tasks/${nonExistentTaskId}`)
      .send({
        description: 'Updated Test Task',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours later
      })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });

});