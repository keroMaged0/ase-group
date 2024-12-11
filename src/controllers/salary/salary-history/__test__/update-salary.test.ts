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
let salaryHistory: SalaryHistory;

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
    
    salaryHistory = await dataSource.getRepository(SalaryHistory).save({
        real_salary: 5000,
        commissions: 500,
        salary: { id: salary.id },
        provider_id: provider.id,
        is_received: false,
    });
});

describe('Update Salary History', () => {
    it('should update salary history successfully', async () => {
        const response = await request
            .patch(`/api/v1/salaries/history/${salaryHistory.id}`)
            .send({
                real_salary: 6000,
                commissions: 600,
            })
            .set('id', users[0].id);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Salary history updated successfully');

        const updatedSalaryHistory = await dataSource.getRepository(SalaryHistory).findOne({
            where: { id: salaryHistory.id },
        });
        expect(updatedSalaryHistory).toBeTruthy();
        expect(updatedSalaryHistory!.real_salary).toBe(6000);
        expect(updatedSalaryHistory!.commissions).toBe(600);
    });

    it('should fail to update salary history with invalid data', async () => {
        const response = await request
            .patch(`/api/v1/salaries/history/${salaryHistory.id}`)
            .send({
                real_salary: -100,
                commissions: 1.5,
            })
            .set('id', users[0].id);

        expect(response.status).toBe(422);
    });

    it('should return 403 if user has no permission to update salary history', async () => {
        await dataSource.getRepository(RolePermission).delete({});

        const response = await request
            .patch(`/api/v1/salaries/history/${salaryHistory.id}`)
            .send({
                real_salary: 6000,
                commissions: 600,
            })
            .set('id', users[0].id);

        expect(response.status).toBe(403);
    });

    it('should return 404 if salary history is not found', async () => {
        const nonExistentSalaryHistoryId = '69c7879a-1d88-41c6-8630-d4af6e314e48';
        const response = await request
            .patch(`/api/v1/salaries/history/${nonExistentSalaryHistoryId}`)
            .send({
                real_salary: 6000,
                commissions: 600,
            })
            .set('id', users[0].id);

        expect(response.status).toBe(404);
    });

    it('should return 404 if salary history does not belong to the provider', async () => {
        const response = await request
            .patch(`/api/v1/salaries/history/${salaryHistory.id}`)
            .send({
                real_salary: 6000,
                commissions: 600,
            })
            .set('id', users[1].id);

        expect(response.status).toBe(404);
    });
});