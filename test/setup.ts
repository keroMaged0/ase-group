import { Vacation } from '../src/models/vacation.model';
import { DoctorReservation } from './../src/models/doctor-reservations.model';
import { AuditLog } from './../src/models/audit-logger.model';
import { UserProfilePharmacy } from './../src/models/user-profile-pharmacy.model';
import { UserProfileDoctor } from './../src/models/user-profile-doctor.model';
import { UserProfileCompany } from './../src/models/user-profile-company.model';
import { UserAuth } from '../src/models/user-auth.model';
import { Country } from '../src/models/country.model';
import { City } from '../src/models/city.model';
import { State } from '../src/models/state.model';
import { AllowedVisitTime } from '../src/models/allowed-visit-times.model';
import { DoctorSpecialty } from '../src/models/doctor-specialty.model';
import { Permission } from '../src/models/permission.model';
import { RolePermission } from '../src/models/role_permissions.model';
import { Role } from '../src/models/role.model';
import { Article } from '../src/models/article.model';
import { ArticleAction } from '../src/models/article-action.model';
import { ArticleComment } from '../src/models/article-comment.model';
import { ArticleCommentAction } from '../src/models/article-comment-action.model';
import { ArticleSpecialization } from '../src/models/article-specialization.model';
import { IjwtPayload } from '../src/types/jwt-payload';
import { dataSource } from '../src/config/typeorm';
import { Commission } from '../src/models/commission.model';

import { VacationRequest } from '../src/models/vacation-request.model';
import { Salary } from '../src/models/salary.model';

import { Punishment } from '../src/models/punishments.model';
import { PunishmentRequest } from '../src/models/punishment-request.model';

import { MedicineCategory } from '../src/models/medicine_category.model';
import { Product } from '../src/models/product.model';
import { Point } from '../src/models/point.model';
import { Target } from '../src/models/target.model';
import { Task } from '../src/models/task.model';
import { pointsRequest } from '../src/models/point-request.model';

process.env.NODE_ENV = 'test';

jest.mock('redis', () => jest.requireActual('redis-mock'));

jest.mock('../src/middlewares/authentication.middlewares', () => {
  return {
    authentication: async (req, res, next) => {
      const id = req.headers['id'] as string;
      if (!id) return next();
      const user = await dataSource
        .getRepository(UserAuth)
        .findOne({ where: { id }, loadRelationIds: true });
      if (!user) return next();
      const permissions = await dataSource.getRepository(RolePermission).find({
        where: { role_id: { id: user.role_id as unknown as string } },
        select: ['permission_key'],
        loadRelationIds: true,
      });
      req.loggedUser = {
        id: user.id,
        is_verified: user.is_verified,
        role_id: user.role_id as any as string,
        user_type: user.user_type,
        permissions: permissions.map((el) => el.permission_key) as any,
        profile_id:
          (user.user_company_profile as unknown as string) ||
          (user.user_doctor_profile as unknown as string) ||
          (user.user_pharmacy_profile as unknown as string),
        provider_id: user.account_provider_id as unknown as string
      } as IjwtPayload;

      return next();
    },
  };
});

beforeAll(async () => {
  console.log('database', process.env.PG_DATABASE);
  await dataSource.initialize();
}, 30000);

beforeEach(async () => {
  await dataSource.getRepository(Salary).delete({});
  await dataSource.getRepository(UserProfileCompany).delete({});
  await dataSource.getRepository(UserProfileDoctor).delete({});
  await dataSource.getRepository(UserProfilePharmacy).delete({});
  await dataSource.getRepository(Country).delete({});
  await dataSource.getRepository(City).delete({});
  await dataSource.getRepository(State).delete({});
  await dataSource.getRepository(AllowedVisitTime).delete({});
  await dataSource.getRepository(AuditLog).delete({});
  await dataSource.getRepository(DoctorReservation).delete({});
  await dataSource.getRepository(PunishmentRequest).delete({});
  await dataSource.getRepository(Punishment).delete({});
  await dataSource.getRepository(UserAuth).delete({});
  await dataSource.getRepository(Task).delete({});
  await dataSource.getRepository(DoctorSpecialty).delete({});
  await dataSource.getRepository(Article).delete({});
  await dataSource.getRepository(ArticleAction).delete({});
  await dataSource.getRepository(ArticleComment).delete({});
  await dataSource.getRepository(Permission).delete({});
  await dataSource.getRepository(RolePermission).delete({});
  await dataSource.getRepository(Role).delete({});
  await dataSource.getRepository(ArticleCommentAction).delete({});
  await dataSource.getRepository(ArticleComment).delete({});
  await dataSource.getRepository(ArticleAction).delete({});
  await dataSource.getRepository(ArticleSpecialization).delete({});
  await dataSource.getRepository(Article).delete({});
  await dataSource.getRepository(VacationRequest).delete({});
  await dataSource.getRepository(Vacation).delete({});
  await dataSource.getRepository(Salary).delete({});
  await dataSource.getRepository(UserAuth).delete({});
  await dataSource.getRepository(Commission).delete({});
  
  await dataSource.getRepository(MedicineCategory).delete({});
  await dataSource.getRepository(Product).delete({});
  await dataSource.getRepository(Point).delete({});
  await dataSource.getRepository(Target).delete({});
  await dataSource.getRepository(UserAuth).delete({});
  await dataSource.getRepository(Permission).delete({});
  await dataSource.getRepository(RolePermission).delete({});
  await dataSource.getRepository(Role).delete({});
  await dataSource.getRepository(pointsRequest).delete({});
});

afterAll(async () => {
  await dataSource.destroy();
});
