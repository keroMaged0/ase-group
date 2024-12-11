import supertest from 'supertest';
import { app } from '../../../../app';
import { dataSource } from '../../../../config/typeorm';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { Salary } from '../../../../models/salary.model';
import { Role } from '../../../../models/role.model';
import { SystemRoles } from '../../../../types/system-roles';
import { Permission } from '../../../../models/permission.model';
import { RolePermission } from '../../../../models/role_permissions.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { SalaryHistory } from '../../../../models/salary-history.model';
import { v4 } from 'uuid';

const request = supertest(app);
let users: UserAuth[];
let salary: Salary;

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

    salary = await dataSource.getRepository(Salary).save({
        target_user: users[1].id,
        amount: 5000,
        sales_ratio: 0.1,
        provider_id: provider.id,
        created_by: users[0].id,
    });
});

describe('Add Salary to History', () => {
    it('should add salary to history successfully', async () => {
        const response = await request
            .post('/api/v1/salaries/history')
            .send({
                target_user: users[1].id,
                real_salary: 5000,
                commissions: 500,
            })
            .set('id', users[0].id);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Salary added to history successfully');

        const salaryHistory = await dataSource.getRepository(SalaryHistory).findOne({
            where: { salary_id: salary.id },
        });

        expect(salaryHistory).toBeTruthy();
        expect(salaryHistory!.real_salary).toBe(5000);
        expect(salaryHistory!.commissions).toBe(500);
    });

    it('should throw 404 if salary not found', async () => {
        const response = await request
            .post('/api/v1/salaries/history')
            .send({
                target_user: v4(),
                real_salary: 5000,
                commissions: 500,
            })
            .set('id', users[0].id);

        expect(response.status).toBe(404);
    });

    it('should throw 422 if validation error', async () => {
        const response = await request
            .post('/api/v1/salaries/history')
            .send({
                target_user: users[1].id,
                real_salary: -100,
                commissions: 500,
            })
            .set('id', users[0].id);

        expect(response.status).toBe(422);
    });

    it('should add salary to history with default real_salary', async () => {
        const response = await request
            .post('/api/v1/salaries/history')
            .send({
                target_user: users[1].id,
                commissions: 500,
            })
            .set('id', users[0].id);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Salary added to history successfully');

        const salaryHistory = await dataSource.getRepository(SalaryHistory).findOne({
            where: { salary_id: salary.id },
        });

        expect(salaryHistory).toBeTruthy();
        expect(salaryHistory!.real_salary).toBe(5000);
        expect(salaryHistory!.commissions).toBe(500);
    });
});