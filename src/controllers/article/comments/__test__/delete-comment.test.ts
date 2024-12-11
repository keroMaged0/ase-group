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
import { Errors } from '../../../../errors';

let testUserId: string;
let testArticleId: string;
let testCommentId: string;
let anotherUserId: string;
beforeEach(async () => {
  const userRepo = dataSource.getRepository(UserAuth);
  const articleRepo = dataSource.getRepository(Article);

  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.remove_comment });
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
  const user = await userRepo.save([
    {
      email: 'user1@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
    },
    {
      email: 'user2@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
    },
  ]);
  testUserId = user[0].id;
  anotherUserId = user[1].id;
  // Create a test article
  const article = await articleRepo.save({
    title: 'Test Article',
    description: 'Test Description',
    created_by: user[0],
  });
  testArticleId = article.id;

  // Create a test comment
  const comment = await dataSource.getRepository(ArticleComment).save({
    article,
    user: user[0],
    content: 'Comment Content',
  });
  testCommentId = comment.id;
});

describe('DELETE /api/v1/articles/comments/:id', () => {
  it('should delete a comment successfully', async () => {
    const response = await request(app)
      .delete(`/api/v1/articles/comments/${testCommentId}`)
      .set('id', testUserId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comment deleted successfully');

    const commentRepo = dataSource.getRepository(ArticleComment);
    const deletedComment = await commentRepo.findOne({ where: { id: testCommentId } });
    expect(deletedComment).toBeNull();
  });

  it('should return 404 if the comment does not exist', async () => {
    const nonExistentCommentId = uuidv4();

    const response = await request(app)
      .delete(`/api/v1/articles/comments/${nonExistentCommentId}`)
      .set('id', testUserId);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not Found');
  });

  it('should return 404 if the user is not the creator of the comment', async () => {
    // Create another user
    const userRepo = dataSource.getRepository(UserAuth);

    const response = await request(app)
      .delete(`/api/v1/articles/comments/${testCommentId}`)
      .set('id', anotherUserId);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

});
