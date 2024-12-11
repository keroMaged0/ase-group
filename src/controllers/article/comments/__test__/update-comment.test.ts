import request from 'supertest';
import { app } from '../../../../app'; // Your Express app
import { dataSource } from '../../../../config/typeorm';
import { Article } from '../../../../models/article.model';
import { ArticleComment } from '../../../../models/article-comment.model';
import { UserAuth, UserType } from '../../../../models/user-auth.model';
import { DoctorSpecialty } from '../../../../models/doctor-specialty.model';
import { Permission } from '../../../../models/permission.model';
import { PERMISSIONS } from '../../../../types/permissions';
import { Role } from '../../../../models/role.model';
import { SystemRoles } from '../../../../types/system-roles';
import { RolePermission } from '../../../../models/role_permissions.model';
import { v4 } from 'uuid';



let testUserId: string;
let testArticleId: string;
let testCommentId: string;
beforeEach(async () => {
  const userRepo = dataSource.getRepository(UserAuth); // Replace 'User' with your User model or table
  const articleRepo = dataSource.getRepository(Article);

  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.update_comment });
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
    title: 'Original Test Article',
    description: 'Original Test Description',
    created_by: user
  });
  testArticleId = article.id;
  const comment = await dataSource.getRepository(ArticleComment).save({article, user, content:'Comment Content'})
  testCommentId = comment.id
});

describe('PUT /api/v1/articles/comments/:id', () => {
  it('should update comment', async () => {

    const response = await request(app)
      .patch(`/api/v1/articles/comments/${testCommentId}`)
      .set('id', testUserId)
      .send({content:'Updated'})

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comment updated successfully');

    const commentRepo = dataSource.getRepository(ArticleComment);
    const updatedComment = await commentRepo.findOne({
      where: { id: testCommentId },
    });


    expect(updatedComment).not.toBeNull();
    expect(updatedComment?.content).toBe('Updated');

  });

  it('should return a 422 error if required fields are missing', async () => {
    const response = await request(app)
      .patch(`/api/v1/articles/comments/${testCommentId}`)
      .set('id', testUserId)
      .send({}); // No data provided

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it('should return a 422 error if id validation faild', async () => {
    const fakeId = 'fake-id'
    const response = await request(app)
      .patch(`/api/v1/articles/comments/${fakeId}`)
      .set('id', testUserId)
      .send({}); 

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });


  it('should return 404 if the comment does not exist', async () => {
    const nonExistentCommentId = v4();

    const response = await request(app)
      .patch(`/api/v1/articles/comments/${nonExistentCommentId}`)
      .set('id', testUserId)
      .send({
        content:'updated'
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});