import request from 'supertest';
import { app } from '../../../../app'; // Your Express app
import { dataSource } from '../../../../config/typeorm';
import { Article } from '../../../../models/article.model';
import { ArticleCommentAction } from '../../../../models/article-comment-action.model';
import { ArticleComment } from '../../../../models/article-comment.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from '../../../../models/permission.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { Role } from '../../../../models/role.model';
import { SystemRoles } from '../../../../types/system-roles';
import { RolePermission } from '../../../../models/role_permissions.model';

let testUserId: string;
let testArticleId: string;
let testCommentId:string
beforeEach(async () => {
  const userRepo = dataSource.getRepository(UserAuth); // Replace 'User' with your User model or table
  const articleRepo = dataSource.getRepository(Article);

  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.comment_action });
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

  // Create a test article
  const article = await articleRepo.save({
    title: 'Test Article',
    description: 'Test Description',
    created_by: user,
  });
  testArticleId = article.id;

  const comment = await dataSource.getRepository(ArticleComment).save({article_id:testArticleId, user_id:testUserId, content:'Hi'})
  testCommentId = comment.id
});

describe('POST /api/v1/articles/comments/:id/toggle-action', () => {
  it('should add the article action successfully', async () => {
    const response = await request(app)
      .post(`/api/v1/articles/comments/${testCommentId}/toggle-action`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Article action toggled successfully');

    // Verify the action in the database
    const actionRepo = dataSource.getRepository(ArticleCommentAction);
    const action = await actionRepo.findOne({
      where: { comment_id: testCommentId, user_id: testUserId },
    });
    expect(action).not.toBeNull();
  });

  it('should remove action successfully', async () => {
    const response = await request(app)
      .post(`/api/v1/articles/comments/${testCommentId}/toggle-action`)
      .set('id', testUserId);
    expect(response.status).toBe(200);

    const response2 = await request(app)
      .post(`/api/v1/articles/comments/${testCommentId}/toggle-action`)
      .set('id', testUserId);

    expect(response2.status).toBe(200);
    expect(response2.body.success).toBe(true);

    const action = await dataSource.getRepository(ArticleCommentAction).findOne({
      where: { comment_id: testCommentId, user_id: testUserId },
    });
    expect(action).toBeNull();
  });

  it('should return 404 if the article does not exist', async () => {
    const nonExistentArticleId = uuidv4();

    const response = await request(app)
      .post(`/api/v1/articles/comments/${nonExistentArticleId}/toggle-action`)
      .set('id', testUserId);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not Found');
  });
  it('should return 422 if the article id is not valid', async () => {
    const notValidId = 'not-valid-id';

    const response = await request(app)
      .post(`/api/v1/articles/comments/${notValidId}/toggle-action`)
      .set('id', testUserId);

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });
});
