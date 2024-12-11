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
let users, category;
beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.update_medicine_category });

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
});

describe('Update Medicine Category', () => {
  it('should update medicine category successfully', async () => {
    const newName = 'Updated Medicine Category';
    const response = await request
      .put(`/api/v1/medicine-categories/${category.id}`)
      .send({ name: newName })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const updatedCategory = await dataSource
      .getRepository(MedicineCategory)
      .findOneBy({ id: category.id });
    expect(updatedCategory?.name).toBe(newName);
  });

  it('should return if medicine category not found', async () => {
    const newName = 'Updated Medicine Category';
    const response = await request
      .put(`/api/v1/medicine-categories/69c7879a-1d88-41c6-8630-d4af6e314e48}`)
      .send({ name: newName })
      .set('id', users[0].id);

    expect(response.status).toBe(422);
  });

  it('should return 403 if user is not authorized', async () => {
    await dataSource.getRepository(RolePermission).delete({});
    const response = await request
      .put(`/api/v1/medicine-categories/${category.id}`)
      .send({ name: 'Updated Medicine Category' })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });

  it('should return not found if medicine category does not exist', async () => {
    const newName = 'Updated Medicine Category';
    const response = await request
      .put(`/api/v1/medicine-categories/69c7879a-1d88-41c6-8630-d4af6e314e48`)
      .send({ name: newName })
      .set('id', users[0].id);

    expect(response.status).toBe(404);
  });
});
