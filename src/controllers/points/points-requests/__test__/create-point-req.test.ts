import supertest from 'supertest';
import { v4 } from 'uuid';

import { UserProfileCompany } from '../../../../models/user-profile-company.model';
import { MedicineCategory } from '../../../../models/medicine_category.model';
import { RolePermission } from '../../../../models/role_permissions.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { Permission } from '../../../../models/permission.model';
import { SystemRoles } from '../../../../types/system-roles';
import { PERMISSIONS } from '../../../../types/permissions';
import { Product } from '../../../../models/product.model';
import { dataSource } from '../../../../config/typeorm';
import { Point } from '../../../../models/point.model';
import { Role } from '../../../../models/role.model';
import { app } from '../../../../app';
import { pointsRequest } from '../../../../models/point-request.model';

const request = supertest(app);
let users, points;
beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.create_point_request });

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

  const product = await dataSource.getRepository(Product).save({
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

  points = await dataSource.getRepository(Point).save({
    created_by: { id: users[0].id },
    provider_id: { id: users[0].id },
    product_id: { id: product.id },
    name: 'Sample Point Name',
    description: 'Sample description',
    points: 20,
    amount: 200,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  });
});

describe('Create point request', () => {
  it('should create point request successfully', async () => {
    const response = await request
      .post('/api/v1/points-request')
      .send({
        point: points.id,
        target_user: users[0].id,
        title: 'Sample Point Request',
        description: 'Sample description',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(201);

    const point = await dataSource.getRepository(pointsRequest).findOne({
      where: { title: 'Sample Point Request' },
    });

    expect(point).toBeDefined();
    expect(point!.title).toBe('Sample Point Request');
  });

  it('should fail to create point with invalid id', async () => {
    const response = await request
      .post('/api/v1/points-request')
      .send({
        point: 'invalid-id',
        target_user: users[0].id,
        title: 'Sample Point Request',
        description: 'Sample description',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(422);

    const point = await dataSource.getRepository(pointsRequest).findOne({
      where: { title: 'Sample Point Request' },
    });
    expect(point).toBeNull();
  });

  it('should return 403 if user has no point to create product', async () => {
    await dataSource.getRepository(RolePermission).delete({});

    const response = await request
      .post('/api/v1/points-request')
      .send({
        point: points.id,
        target_user: users[0].id,
        title: 'Sample Point Request',
        description: 'Sample description',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(403);
  });
});
