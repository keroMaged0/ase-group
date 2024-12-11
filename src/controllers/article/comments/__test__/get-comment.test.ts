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
    .save({ key: PERMISSIONS.get_comment });
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
    role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id }
  });
  testUserId = user.id;

  // Create a test article
  const article = await articleRepo.save({
    title: 'Test Article',
    description: 'Test Description',
    created_by: user,
  });
  testArticleId = article.id;

  // Create a test comment
  const comment = await dataSource.getRepository(ArticleComment).save({
    article,
    user,
    content: 'Comment Content',
  });
  testCommentId = comment.id;

  // Create a test reply
  await dataSource.getRepository(ArticleComment).save({
    article,
    user,
    content: 'Reply Content',
    parent: comment,
  });

 // create a test like
  await dataSource.getRepository(ArticleCommentAction).save({
    comment,
    user,
  });
});

describe('GET /api/v1/articles/comments/:id', () => {
  it('should fetch a single comment with correct created_by data', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/comments/${testCommentId}`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data.created_by).toHaveProperty('id');
    expect(response.body.data.created_by).toHaveProperty('email');
  });

  it('should fetch a single comment with correct replies_count', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/comments/${testCommentId}`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data.replies_count).toBe(1);
  });

  it('should fetch a single comment with correct likes_count', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/comments/${testCommentId}`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data.likes_count).toBe(1);
  });

  it('should fetch a single comment with correct is_liked status', async () => {
    const response = await request(app)
      .get(`/api/v1/articles/comments/${testCommentId}`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comments retrieved successfully');
    expect(response.body.data.is_liked).toBe(true);
  });

  it('should return 404 if the comment does not exist', async () => {
    const nonExistentCommentId = uuidv4();

    const response = await request(app)
      .get(`/api/v1/articles/comments/${nonExistentCommentId}`)
      .set('id', testUserId);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not Found');
  });

});