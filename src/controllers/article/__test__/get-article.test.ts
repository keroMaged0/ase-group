import request from 'supertest';
import { app } from '../../../app'; // Your Express app
import { dataSource } from '../../../config/typeorm';
import { Article } from '../../../models/article.model';
import { ArticleSpecialization } from '../../../models/article-specialization.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { DoctorSpecialty } from '../../../models/doctor-specialty.model';
import { ArticleComment } from '../../../models/article-comment.model';
import { ArticleAction } from '../../../models/article-action.model';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from '../../../models/permission.model';
import { PERMISSIONS } from '../../../types/permissions';
import { Role } from '../../../models/role.model';
import { SystemRoles } from '../../../types/system-roles';
import { RolePermission } from '../../../models/role_permissions.model';

let testUserId: string;
let testArticleId: string;
let testSpecializationId1: string;
let testSpecializationId2: string;

beforeEach(async () => {
  const userRepo = dataSource.getRepository(UserAuth);
  const specializationRepo = dataSource.getRepository(DoctorSpecialty);
  const articleRepo = dataSource.getRepository(Article);
  const commentRepo = dataSource.getRepository(ArticleComment);
  const actionRepo = dataSource.getRepository(ArticleAction);

  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.get_article });
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
    is_verified: true,
    is_verified_by_crm: true,
    role_id: { id: roles.find((role) => role.key === SystemRoles.doctor)?.id },
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

  // Create test articles
  const articles = await articleRepo.save({
    title: 'Test Article 1',
    description: 'Test Description 1',
    created_by: user,
    specializations: [
      { specialization_id: testSpecializationId1 },
      { specialization_id: testSpecializationId2 },
    ],
  });

  testArticleId = articles.id;
  // Create test comments
  await commentRepo.save([
    { article: articles, content: 'Test Comment 1', created_by: user },
    { article: articles, content: 'Test Comment 2', created_by: user },
  ]);

  // Create test likes
  await actionRepo.save({
    article: articles,
    user,
  });
});

describe('GET /api/v1/articles/:id', () => {
  it('should fetch a single article with correct created_by data', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Articles fetched successfully');
    expect(response.body.data.created_by).toHaveProperty('id');
    expect(response.body.data.created_by).toHaveProperty('email');
  });

  it('should fetch a single article with correct comments_count', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}`)
      .set('id', testUserId);
console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Articles fetched successfully');
    expect(response.body.data.comments_count).toBe(2);
  });

  it('should fetch a single article with correct likes_count', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Articles fetched successfully');
    expect(response.body.data.likes_count).toBe(1);
  });

  it('should fetch a single article with correct is_liked status', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Articles fetched successfully');
    expect(response.body.data.is_liked).toBe(true);
  });

  it('should return 404 if the article is not found', async () => {
    const nonExistentArticleId = uuidv4();
    const response = await request(app)
      .get(`/api/v1/articles/${nonExistentArticleId}`)
      .set('id', testUserId);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not Found');
  });
});
