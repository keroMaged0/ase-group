import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { Commission, CommissionType } from '../../../models/commission.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { app } from '../../../app';
import { Permission } from '../../../models/permission.model';
import { RolePermission } from '../../../models/role_permissions.model';
import { Role } from '../../../models/role.model';
import { SystemRoles } from '../../../types/system-roles';
import { PERMISSIONS } from '../../../types/permissions';
jest.mock('../../../config/s3', () => {
  return {
    awsS3: {
      saveBucketFiles: jest.fn().mockResolvedValue(undefined),
      removeBucketFiles: jest.fn().mockResolvedValue(undefined),
    },
  };
});

const request = supertest(app);
let users;

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.create_commission });

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

  users = await dataSource.getRepository(UserAuth).save([
    {
      email: 'user1@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
    },
  ]);
});

describe('Commission Controller', () => {
  it('should create commission successfully', async () => {
    const commissionData = {
      title: 'New Commission',
      description: 'Commission description',
      percentage: 15.5,
      collection_duration_days: 30,
      commission_type: CommissionType.TypeOne,
    };

    const response = await request
      .post('/api/v1/commissions')
      .send(commissionData)
      .set('id', users[0].id);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.title).toBe(commissionData.title);
    expect(response.body.data.commission_type).toBe(commissionData.commission_type);
  });

  it('should paginate commissions successfully', async () => {
    const commissionData = {
      title: 'Test Commission',
      description: 'Commission description',
      percentage: 20.0,
      collection_duration_days: 15,
      commission_type: CommissionType.TypeTwo,
    };

    await request.post('/api/v1/commissions').send(commissionData).set('id', users[0].id);

    const response = await request
      .get('/api/v1/commissions')
      .query({
        title: 'Test Commission',
        created_at_from: '2023-01-01',
        created_at_to: '2023-12-31',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.pagination).toHaveProperty('currentPage');
  });

  it('should fetch one commission successfully', async () => {
    const commission = await dataSource.getRepository(Commission).save({
      title: 'Single Commission',
      description: 'Commission description',
      percentage: 10.0,
      collection_duration_days: 20,
      commission_type: CommissionType.TypeThree,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request
      .get(`/api/v1/commissions/${commission.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(commission.id);
  });

  it('should update commission successfully', async () => {
    const commission = await dataSource.getRepository(Commission).save({
      title: 'Old Commission',
      description: 'Commission description',
      percentage: 10.0,
      collection_duration_days: 20,
      commission_type: CommissionType.TypeOne,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request
      .patch(`/api/v1/commissions/${commission.id}`)
      .send({ title: 'Updated Commission' })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const updatedCommission = await dataSource
      .getRepository(Commission)
      .findOne({ where: { id: commission.id } });
    expect(updatedCommission?.title).toBe('Updated Commission');
  });

  it('should delete commission successfully', async () => {
    const commission = await dataSource.getRepository(Commission).save({
      title: 'Commission to delete',
      description: 'Commission description',
      percentage: 15.0,
      collection_duration_days: 30,
      commission_type: CommissionType.TypeOne,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request
      .delete(`/api/v1/commissions/${commission.id}`)
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const deletedCommission = await dataSource
      .getRepository(Commission)
      .findOne({ where: { id: commission.id } });
    expect(deletedCommission).toBeUndefined();
  });

  it('should handle not found commission error', async () => {
    const response = await request.get('/api/v1/commissions/invalid-id').set('id', users[0].id);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Commission not found');
  });

  it('should handle pagination with filters', async () => {
    await dataSource.getRepository(Commission).save({
      title: 'Commission 1',
      description: 'Test Commission',
      percentage: 5.0,
      collection_duration_days: 10,
      commission_type: CommissionType.TypeOne,
      provider_id: { id: users[0].id },
      created_by: { id: users[0].id },
    });

    const response = await request
      .get('/api/v1/commissions')
      .query({
        title: 'Commission',
        created_at_from: '2023-01-01',
        created_at_to: '2023-12-31',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
