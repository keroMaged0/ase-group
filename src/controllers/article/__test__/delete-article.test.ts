import request from 'supertest';
import { app } from '../../../app'; // Your Express app
import { dataSource } from '../../../config/typeorm';
import { awsS3 } from '../../../config/s3';
import { Article } from '../../../models/article.model';
import { ArticleSpecialization } from '../../../models/article-specialization.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { DoctorSpecialty } from '../../../models/doctor-specialty.model';
import { Permission } from '../../../models/permission.model';
import { PERMISSIONS } from '../../../types/permissions';
import { Role } from '../../../models/role.model';
import { SystemRoles } from '../../../types/system-roles';
import { RolePermission } from '../../../models/role_permissions.model';
import { v4 as uuidv4 } from 'uuid';

// Mock AWS S3
jest.mock('../../../config/s3', () => ({
  awsS3: {
    saveBucketFiles: jest.fn(),
    removeBucketFiles: jest.fn(),
    getFiles: () => (req, res, next) => {},
  },
}));

let testUserId: string;
let testArticleId: string;
let testSpecializationId1: string;
let testSpecializationId2: string;

beforeEach(async () => {
  const userRepo = dataSource.getRepository(UserAuth); // Replace 'User' with your User model or table
  const specializationRepo = dataSource.getRepository(DoctorSpecialty);
  const articleRepo = dataSource.getRepository(Article);

  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.remove_article });
  const roles = await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );
  await dataSource.getRepository(RolePermission).save(
    roles.map((role) => ({
      role_id: { id: role.id },
      permission_key: { key: permissions.key },
    })),
  );
  // Create a test user
  const user = await userRepo.save({
    email: 'user1@email.com',
    phone: '01234567891',
    user_type: UserType.company,
    role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
    is_verified: true,
    is_verified_by_crm: true,
  });
  testUserId = user.id;

  // Create test specializations
  const specialization1 = await specializationRepo.save({
    title: 'Specialization 1',
    description: 'spec desc 1',
  });
  const specialization2 = await specializationRepo.save({
    title: 'Specialization 2',
    description: 'spec desc 2',
  });
  testSpecializationId1 = specialization1.id;
  testSpecializationId2 = specialization2.id;

  // Create a test article
  const article = await articleRepo.save({
    title: 'Test Article',
    description: 'Test Description',
    created_by: user,
    specializations: [
      { specialization_id: testSpecializationId1 },
      { specialization_id: testSpecializationId2 },
    ],
  });
  testArticleId = article.id;
});

describe('DELETE /api/v1/articles/:id', () => {
  it('should delete an article successfully', async () => {
    const response = await request(app)
      .delete(`/api/v1/articles/${testArticleId}`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Article deleted successfully');

    const articleRepo = dataSource.getRepository(Article);
    const deletedArticle = await articleRepo.findOne({ where: { id: testArticleId } });
    expect(deletedArticle).toBeNull();
  });

  it('should return 404 if the article does not exist', async () => {
    const nonExistentArticleId = uuidv4();

    const response = await request(app)
      .delete(`/api/v1/articles/${nonExistentArticleId}`)
      .set('id', testUserId);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not Found');
  });

  it('should return 404 if the user is not the creator of the article', async () => {
    // Create another user
    const userRepo = dataSource.getRepository(UserAuth);
    const anotherUser = await userRepo.save({
      email: 'user2@email.com',
      phone: '09876543210',
      user_type: UserType.company,
      role_id: { id: (await dataSource.getRepository(Role).findOne({ where: { key: SystemRoles.company_owner } }))?.id },
      is_verified: true,
      is_verified_by_crm: true,
    });

    const response = await request(app)
      .delete(`/api/v1/articles/${testArticleId}`)
      .set('id', anotherUser.id);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('should handle id validation error', async () => {

    const response = await request(app)
      .delete(`/api/v1/articles/${testArticleId.slice(0,-1)}`)
      .set('id', testUserId);

    expect(response.status).toBe(422);
  });
});