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
let tasks: Task[];

beforeEach(async () => {
    const permissions = await dataSource
        .getRepository(Permission)
        .save({ key: PERMISSIONS.get_tasks });
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

     const   provider = await dataSource.getRepository(UserAuth).save(
            {
                email: 'user@example.com',
                phone: '01234567891',
                user_type: UserType.company,
                role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
                is_verified: true,
                is_verified_by_crm: true,
            },
        );

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

    tasks = await dataSource.getRepository(Task).save([
        {
            description: 'Test Task 1',
            start_at: new Date(),
            end_at: new Date(Date.now() + 3600000), // 1 hour later
            target_user: users[0].id,
            provider_id: provider.id,
            created_by: users[0].id,
            status: TASK_STATUS.pending,
        },
        {
            description: 'Test Task 2',
            start_at: new Date(),
            end_at: new Date(Date.now() + 7200000), // 2 hours later
            target_user: users[0].id,
            provider_id: provider.id,
            created_by: users[0].id,
            status: TASK_STATUS.done,
        },
    ]);
});

describe('Get Provider Tasks', () => {
    it('should fetch all tasks for the provider', async () => {
        const response = await request
            .get('/api/v1/tasks')
            .set('id', users[0].id);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
    });

    it('should fetch tasks with specific status for the provider', async () => {
        const response = await request
            .get('/api/v1/tasks')
            .query({ status: TASK_STATUS.pending })
            .set('id', users[0].id);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(+response.body.data[0].status).toBe(TASK_STATUS.pending);
    });

    it('should fetch tasks within a date range for the provider', async () => {
        const startDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
        const endDate = new Date(Date.now() + 10800000).toISOString(); // 3 hours later

        const response = await request
            .get('/api/v1/tasks')
            .query({ start_at: startDate, end_at: endDate })
            .set('id', users[0].id);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
    });

    it('should return 403 if provider has no permission to view tasks', async () => {
        await dataSource.getRepository(RolePermission).delete({});

        const response = await request
            .get('/api/v1/tasks')
            .set('id', users[0].id);

        expect(response.status).toBe(403);
    });

    it('should handle errors during fetching tasks', async () => {
        jest
            .spyOn(dataSource.getRepository(Task), 'createQueryBuilder')
            .mockImplementationOnce(() => {
                throw new Error('Test Error');
            });

        const response = await request
            .get('/api/v1/tasks')
            .set('id', users[0].id);

        expect(response.status).toBe(500);
    });
});