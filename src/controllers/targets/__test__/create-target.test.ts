import supertest from 'supertest';

import { UserProfileCompany } from '../../../models/user-profile-company.model';
import { MedicineCategory } from '../../../models/medicine_category.model';
import { RolePermission } from '../../../models/role_permissions.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { Permission } from '../../../models/permission.model';
import { SystemRoles } from '../../../types/system-roles';
import { PERMISSIONS } from '../../../types/permissions';
import { Product } from '../../../models/product.model';
import { Target } from '../../../models/target.model';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { app } from '../../../app';
import { v4 } from 'uuid';

const request = supertest(app);
let users, product;
beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.create_target });

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

  const category = await dataSource.getRepository(MedicineCategory).save({
    name: 'Test Medicine Category',
    provider_id: { id: users[0].id },
    created_by: { id: users[0].id },
    parent_id: null,
  });

  product = await dataSource.getRepository(Product).save({
    medicine_category_id: { id: category.id },
    name: 'Test Product',
    price: 100,
    quantity: 100,
    description: 'Test Product Description',
    scientific_name: 'Test Scientific Name',
    caliber: 'Test Caliber',
    provider_id: { id: users[0].id },
    created_by: { id: users[0].id },
  });
});

describe('Create target', () => {
  it('should create target successfully', async () => {
    const response = await request
      .post('/api/v1/targets')
      .send({
        employee_id: users[0].id,
        product_id: product.id,
        target_type: 'Quarterly',
        target_quantity: 20,
        target_amount: 2000,
        start_date: '2024-11-05',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const target = await dataSource.getRepository(Target).findOne({
      where: { target_quantity: 20 },
    });

    expect(target).toBeDefined();
    expect(target!.target_quantity).toBe(20);
  });

  it('should fail to create point with invalid id', async () => {
    const response = await request
      .post('/api/v1/targets')
      .send({
        employee_id: 'invalid-id',
        product_id: 'invalid-id',
        target_type: 'Quarterly',
        target_quantity: 20,
        target_amount: 2000,
        start_date: '2024-11-05',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(422);

    const target = await dataSource.getRepository(Target).findOne({
      where: { target_quantity: 20 },
    });
    expect(target).toBeNull();
  });

  it('should return 403 if user has no point to create product', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const response = await request
      .post('/api/v1/targets')
      .send({
        employee_id: users[0].id,
        product_id: product.id,
        target_type: 'Quarterly',
        target_quantity: 20,
        target_amount: 2000,
        start_date: '2024-11-05',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
