import request from 'supertest';
import { app } from '../../../../app'; // Your Express app
import { dataSource } from '../../../../config/typeorm';
import { Article } from '../../../../models/article.model';
import { ArticleComment } from '../../../../models/article-comment.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { Permission } from '../../../../models/permission.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { Role } from '../../../../models/role.model';
import { SystemRoles } from '../../../../types/system-roles';
import { RolePermission } from '../../../../models/role_permissions.model';
import { v4 as uuidv4 } from 'uuid';

let testUserId: string;
let testArticleId: string;
let testCommentId: string;

beforeEach(async () => {
  const userRepo = dataSource.getRepository(UserAuth); // Replace 'User' with your User model or table
  const articleRepo = dataSource.getRepository(Article);

  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.create_comment });
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
});

describe('POST /api/v1/articles/comments', () => {
  it('should create a comment successfully', async () => {
    const response = await request(app)
      .post('/api/v1/articles/comments')
      .set('id', testUserId)
      .send({
        articleId: testArticleId,
        content: 'New Comment',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify the comment in the database
    const commentRepo = dataSource.getRepository(ArticleComment);
    const newComment = await commentRepo.findOne({
      where: { content: 'New Comment' },
    });

    expect(newComment).not.toBeNull();
    expect(newComment?.content).toBe('New Comment');
  });

  it('should create a reply to a comment successfully', async () => {
    const response = await request(app)
      .post('/api/v1/articles/comments')
      .set('id', testUserId)
      .send({
        parentId: testCommentId,
        articleId: testArticleId,
        content: 'Reply Comment',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comment created successfully');

    // Verify the reply in the database
    const commentRepo = dataSource.getRepository(ArticleComment);
    const replyComment = await commentRepo.findOne({
      where: { content: 'Reply Comment' },
      relations: ['parent'],
    });

    expect(replyComment).not.toBeNull();
    expect(replyComment?.content).toBe('Reply Comment');
    expect(replyComment?.parent?.id).toBe(testCommentId);
  });

  it('should return 400 if trying to reply to a reply', async () => {
    // Create a reply to the original comment
    const reply = await dataSource.getRepository(ArticleComment).save({
      parent: { id: testCommentId },
      user: { id: testUserId },
      article: { id: testArticleId },
      content: 'First Reply',
    });

    const response = await request(app)
      .post('/api/v1/articles/comments')
      .set('id', testUserId)
      .send({
        parentId: reply.id,
        articleId: testArticleId,
        content: 'Reply to Reply',
      });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should return 404 if the parent comment does not exist', async () => {
    const nonExistentParentId = uuidv4();

    const response = await request(app)
      .post('/api/v1/articles/comments')
      .set('id', testUserId)
      .send({
        parentId: nonExistentParentId,
        articleId: testArticleId,
        content: 'Reply to Non-Existent Comment',
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not Found');
  });

  it('should return 422 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/v1/articles/comments')
      .set('id', testUserId)
      .send({}); // No data provided

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

//   it('should return 500 if there is a server error', async () => {
//     jest
//       .spyOn(dataSource.getRepository(ArticleComment), 'save')
//       .mockRejectedValue(new Error('Server Error'));

//     const response = await request(app)
//       .post('/api/v1/articles/comments')
//       .set('id', testUserId)
//       .send({
//         articleId: testArticleId,
//         content: 'New Comment',
//       });

//     expect(response.status).toBe(500);
//     expect(response.body.success).toBe(false);
//     expect(response.body.message).toBe('Failed to create comment');
//   });
});
