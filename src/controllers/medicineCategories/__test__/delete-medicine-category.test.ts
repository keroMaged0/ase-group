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

const request = supertest(app);
let users, category, subCategory;
beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.remove_medicine_category });

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

  category = await dataSource.getRepository(MedicineCategory).save({
    name: 'Test Medicine Category',
    provider_id: { id: users[0].id },
    created_by: { id: users[0].id },
    parent_id: null,
  });
  subCategory = await dataSource.getRepository(MedicineCategory).save({
    name: 'Sub Medicine Category',
    provider_id: { id: users[0].id },
    created_by: { id: users[0].id },
    parent_id: category.id, 
  });
});

describe('Delete Medicine Category', () => {
  it('should delete medicine category and its subcategories successfully', async () => {
    const response = await request
      .delete(`/api/v1/medicine-categories/${category.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const deletedCategory = await dataSource.getRepository(MedicineCategory).findOne({
      where: { id: category.id },
    });
    expect(deletedCategory).toBeTruthy();
    expect(deletedCategory?.is_deleted).toBe(true);

    const deletedSubCategory = await dataSource.getRepository(MedicineCategory).findOne({
      where: { id: subCategory.id },
    });
    expect(deletedSubCategory).toBeTruthy();
    expect(deletedSubCategory?.is_deleted).toBe(true);
  });

  it('should return medicine category not found error', async () => {
    const response = await request
      .delete(`/api/v1/medicine-categories/invalid-id`)
      .set('id', users[0].id);

    expect(response.status).toBe(422);
  });

  it('should return 422 Medicine category id must be a valid UUID error', async () => {
    const response = await request
      .delete(`/api/v1/medicine-categories/invalid-id`)
      .set('id', users[0].id);

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('VALIDATION_ERROR');
  });

  it('should return 403 if user has no permission to delete category medicine', async () => {
    await dataSource.getRepository(RolePermission).delete({});
    const response = await request
      .delete(`/api/v1/medicine-categories/${category.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Unauthorized');
  });
});