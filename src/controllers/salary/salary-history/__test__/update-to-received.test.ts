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
        .save([{ key: PERMISSIONS.receive_salary }]);

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

describe('Update Salary to Received', () => {
    it('should update salary to received successfully', async () => {
        const response = await request
            .patch(`/api/v1/salaries/history/receive/${salaryHistory.id}`)
            .set('id', users[1].id);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Salary paid successfully');

        const updatedSalaryHistory = await dataSource.getRepository(SalaryHistory).findOne({
            where: { id: salaryHistory.id },
        });

        expect(updatedSalaryHistory).toBeTruthy();
        expect(updatedSalaryHistory!.is_received).toBe(true);
    });

    it('should return 404 if salary history is not found', async () => {
        const nonExistentSalaryHistoryId = '69c7879a-1d88-41c6-8630-d4af6e314e48';
        const response = await request
            .patch(`/api/v1/salaries/history/receive/${nonExistentSalaryHistoryId}`)
            .set('id', users[1].id);

        expect(response.status).toBe(404);
    });

    it('should return 404 if salary history does not belong to the user', async () => {
        const response = await request
            .patch(`/api/v1/salaries/history/receive/${salaryHistory.id}`)
            .set('id', users[0].id);

        expect(response.status).toBe(404);
    });

    it('should return 422 if id is not valid', async () => {
        const invalidId = 'invalid-id';
        const response = await request
            .patch(`/api/v1/salaries/history/receive/${invalidId}`)
            .set('id', users[1].id);

        expect(response.status).toBe(422);
    });

    it('should return 403 if user has no permission to receive salary', async () => {
        await dataSource.getRepository(RolePermission).delete({});

        const response = await request
            .patch(`/api/v1/salaries/history/receive/${salaryHistory.id}`)
            .set('id', users[1].id);

        expect(response.status).toBe(403);
    });
});