import request from 'supertest';
import { app } from '../../../../app'; // Your Express app
import { dataSource } from '../../../../config/typeorm';
import { Article } from '../../../../models/article.model';
import { ArticleComment } from '../../../../models/article-comment.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from '../../../../models/permission.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { Role } from '../../../../models/role.model';
import { SystemRoles } from '../../../../types/system-roles';
import { RolePermission } from '../../../../models/role_permissions.model';
import { ArticleCommentAction } from '../../../../models/article-comment-action.model';

let testUserId: string;
let testArticleId: string;
let testCommentId: string;

beforeEach(async () => {
  const userRepo = dataSource.getRepository(UserAuth); // Replace 'User' with your User model or table
  const articleRepo = dataSource.getRepository(Article);

  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.get_comments });
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
    role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
  });
  testUserId = user.id;

  // Create a test article
  const article = await articleRepo.save({
    title: 'Test Article',
    description: 'Test Description',
    created_by: user,
  });
  testArticleId = article.id;

  // Create test comments
  const commentRepo = dataSource.getRepository(ArticleComment);
  const comment1 = await commentRepo.save({
    article,
    user,
    content: 'Test Comment 1',
  });
  const comment2 = await commentRepo.save({
    article,
    user,
    content: 'Test Comment 2',
  });
  testCommentId = comment1.id;

  // Create a test reply
  await commentRepo.save({
    article,
    user,
    content: 'Test Reply',
    parent: comment1,
  });
  
  // create a test like
  await dataSource.getRepository(ArticleCommentAction).save({
    comment: comment1,
    user,
  });
});

describe('GET /api/v1/articles/:id/comments', () => {
  it('should fetch comments successfully with pagination', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}/comments`)
      .query({ page: 1, limit: 1 })
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination.currentPage).toBe(1);
    expect(response.body.pagination.totalPages).toBe(2);
    expect(response.body.pagination.resultCount).toBe(1);
  });

  it('should fetch all comments for an article', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}/comments`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.map((comment) => comment.content)).toEqual(
      expect.arrayContaining(['Test Comment 1', 'Test Comment 2']),
    );
  });


  it('should fetch comments with correct created_by data', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}/comments`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data[0].created_by).toHaveProperty('id');
    expect(response.body.data[0].created_by).toHaveProperty('email');
  });

  it('should fetch comments with correct replies_count', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}/comments`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data[0].replies_count).toBe(1);
  });

  it('should fetch comments with correct likes_count', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}/comments`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data[0].likes_count).toBe(1);
  });

  it('should fetch comments with correct is_liked status', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/${testArticleId}/comments`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data[0].is_liked).toBe(true);
  });

});
