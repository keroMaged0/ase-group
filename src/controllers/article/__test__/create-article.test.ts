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

// Mock AWS S3
jest.mock('../../../config/s3', () => ({
  awsS3: {
    saveBucketFiles: jest.fn(),
    getFiles: () => (req, res, next) => {},
  },
}));

let testUserId: string;
let testSpecializationId1: string;
let testSpecializationId2: string;

beforeEach(async () => {
  const userRepo = dataSource.getRepository(UserAuth); // Replace 'User' with your User model or table
  const specializationRepo = dataSource.getRepository(DoctorSpecialty);

  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.create_article });
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
});

describe('POST /api/v1/articles', () => {
  it('should create an article successfully with specializations and a picture', async () => {
    (awsS3.saveBucketFiles as jest.Mock).mockResolvedValue(true); // Mock successful S3 upload

    const response = await request(app)
      .post('/api/v1/articles')
      .set('id', testUserId)
      .field('title', 'Test Article')
      .field('description', 'Test Description')
      .field('specializations', [testSpecializationId1, testSpecializationId2])
      .attach('picture', Buffer.from('mock-file-content'), 'download.jpeg');

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Article created successfully');

    // Verify the article in the database
    const articleRepo = dataSource.getRepository(Article);
    const savedArticle = await articleRepo.findOne({
      where: { title: 'Test Article' },
      relations: ['specializations'], // Adjust relations as needed
    });

    const isImageStartWithArticle = savedArticle?.picture?.startsWith('article');

    expect(savedArticle).not.toBeNull();
    expect(savedArticle?.description).toBe('Test Description');
    expect(isImageStartWithArticle).toBe(true);
    expect(savedArticle?.specializations).toHaveLength(2);
    expect(savedArticle?.specializations.map((s) => s.specialization_id)).toContain(
      testSpecializationId1,
    );
    expect(savedArticle?.specializations.map((s) => s.specialization_id)).toContain(
      testSpecializationId2,
    );
  });

  it('should return a 422 error if required fields are missing', async () => {
    const response = await request(app).post('/api/v1/articles').set('id', testUserId).send({}); // No data provided

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it('should handle errors during file upload', async () => {
    (awsS3.saveBucketFiles as jest.Mock).mockRejectedValue(new Error('S3 Error'));

    const response = await request(app)
      .post('/api/v1/articles')
      .set('id', testUserId)
      .field('title', 'Test Article')
      .field('description', 'Test Description')
      .field('specializations', [testSpecializationId1, testSpecializationId2])
      .attach('picture', Buffer.from('mock-file-content'), 'download.jpeg');
    expect(response.status).toBe(500);
  });
});
