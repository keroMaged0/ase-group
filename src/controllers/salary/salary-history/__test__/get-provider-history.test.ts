import supertest from 'supertest';
import { app } from '../../../../app';
import { dataSource } from '../../../../config/typeorm';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { SalaryHistory } from '../../../../models/salary-history.model';
import { Role } from '../../../../models/role.model';
import { SystemRoles } from '../../../../types/system-roles';
import { Permission } from '../../../../models/permission.model';
import { RolePermission } from '../../../../models/role_permissions.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { v4 } from 'uuid';
import { Salary } from '../../../../models/salary.model';

const request = supertest(app);
let users: UserAuth[];
let salaryHistories: SalaryHistory[];

beforeEach(async () => {
    const permissions = await dataSource
        .getRepository(Permission)
        .save([{ key: PERMISSIONS.manage_salary_history }]);

    const roles = await dataSource.getRepository(Role).save(
        Object.values(SystemRoles).map((role) => ({
            key: role,
        })),
    );

    await dataSource.getRepository(RolePermission).save(
        roles.map((role) => ({
            role_id: { id: role.id },
            permission_key: { key: permissions[0].key },
        })),
    );

    const provider = await dataSource.getRepository(UserAuth).save({
        email: 'provider@example.com',
        phone: '01234567891',
        user_type: UserType.company,
        role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
        is_verified: true,
        is_verified_by_crm: true,
    });

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
        {
            email: 'user2@example.com',
            phone: '01234567891',
            user_type: UserType.doctor,
            role_id: { id: roles.find((role) => role.key === SystemRoles.doctor)?.id },
            is_verified: true,
            is_verified_by_crm: true,
        },
    ]);
    const salary = await dataSource.getRepository(Salary).save({
        amount: 5000,
        sales_ratio: 0.1,
        target_user: users[1].id,
        created_by: users[0].id,
        provider_id: provider.id,
      });
    
    salaryHistories = await dataSource.getRepository(SalaryHistory).save([
        {
            real_salary: 5000,
            commissions: 500,
            salary: { id: salary.id },
            provider_id: provider.id,
            is_received: false,
        },
        {
            real_salary: 6000,
            commissions: 600,
            salary: { id: salary.id },
            provider_id: provider.id,
            is_received: true,
        },
    ]);
});

describe('Get Provider Salary History', () => {
    it('should return salary history successfully', async () => {
        const response = await request
            .get('/api/v1/salaries/history')
            .set('id', users[0].id)
            .query({ page: 1, limit: 10 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0]).toHaveProperty('real_salary');
        expect(response.body.data[0]).toHaveProperty('commissions');
        expect(response.body.data[0]).toHaveProperty('is_received');
    });

    it('should return salary history with pagination', async () => {
        const response = await request
            .get('/api/v1/salaries/history')
            .set('id', users[0].id)
            .query({ page: 1, limit: 1 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.pagination.currentPage).toBe(1);
        expect(response.body.pagination.resultCount).toBe(1);
        expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should return empty data if no salary history found', async () => {
        await dataSource.getRepository(SalaryHistory).delete({});
        const response = await request
            .get('/api/v1/salaries/history')
            .set('id', users[0].id)
            .query({ page: 1, limit: 10 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(0);
    });

    it('should return 403 if user has no permission to view salary history', async () => {
        await dataSource.getRepository(RolePermission).delete({});
        const response = await request
            .get('/api/v1/salaries/history')
            .set('id', users[0].id)
            .query({ page: 1, limit: 10 });

        expect(response.status).toBe(403);
    });

});