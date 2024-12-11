import supertest from 'supertest';

import { UserProfileCompany } from '../../../models/user-profile-company.model';
import { MedicineCategory } from '../../../models/medicine_category.model';
import { RolePermission } from '../../../models/role_permissions.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { Permission } from '../../../models/permission.model';
import { SystemRoles } from '../../../types/system-roles';
import { PERMISSIONS } from '../../../types/permissions';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { app } from '../../../app';
import { v4 } from 'uuid';
import path from 'path';

const request = supertest(app);
let users;
beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.create_medicine_category });

  const roles = await dataSource
    .getRepository(Role)
    .save(Object.values(SystemRoles).map((role) => ({ key: role })));

  await dataSource.getRepository(RolePermission).save(
    roles.map((role) => ({
      role_id: { id: role.id },
      permission_key: { key: permissions.key },
    })),
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

describe('Create Medicine Category', () => {
  it('should create medicine category successfully', async () => {
    const response = await request
      .post('/api/v1/medicine-categories')
      .send({ name: 'Test Medicine Category' })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Medicine category created successfully');
    expect(response.body.data).toHaveProperty('name', 'Test Medicine Category');
    expect(response.body.data).toHaveProperty('parent_id', null);

    const medicineCategory = await dataSource.getRepository(MedicineCategory).findOne({
      where: { name: 'Test Medicine Category' },
    });

    expect(medicineCategory).toBeDefined();
    expect(medicineCategory!.name).toBe('Test Medicine Category');
  });

  it('should fail to create medicine category without name', async () => {
    const response = await request.post('/api/v1/medicine-categories').set('id', users[0].id);

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('VALIDATION_ERROR');
  });

  it('should fail to create medicine category with invalid parent_id', async () => {
    const response = await request
      .post('/api/v1/medicine-categories')
      .set('id', users[0].id)
      .send({ name: 'Test Medicine Category', parent_id: 'invalid-uuid' });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('VALIDATION_ERROR');
  });

  it('should return 403 if user has no permission to create category medicine', async () => {
    await dataSource.getRepository(RolePermission).delete({});
    const response = await request
      .post('/api/v1/medicine-categories')
      .send({
        name: 'Test Medicine Category',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });

});
