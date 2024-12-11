import { DataSource } from 'typeorm';

import { env } from './env';
import { logger } from './winston';
import { UserAuth } from '../models/user-auth.model';
import { UserProfileCompany } from '../models/user-profile-company.model';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';
import { City } from '../models/city.model';
import { Country } from '../models/country.model';
import { AllowedVisitTime } from '../models/allowed-visit-times.model';
import { AuditLog } from '../models/audit-logger.model';
import { DoctorReservation } from '../models/doctor-reservations.model';
import { State } from '../models/state.model';
import { UserProfileDoctor } from '../models/user-profile-doctor.model';
import { UserProfilePharmacy } from '../models/user-profile-pharmacy.model';
import { DoctorSpecialty } from '../models/doctor-specialty.model';
import { RolePermission } from '../models/role_permissions.model';
import { Article } from '../models/article.model';
import { ArticleSpecialization } from '../models/article-specialization.model';
import { ArticleAction } from '../models/article-action.model';
import { ArticleComment } from '../models/article-comment.model';
import { ArticleCommentAction } from '../models/article-comment-action.model';
import { Vacation } from '../models/vacation.model';
import { VacationRequest } from '../models/vacation-request.model';

import { UserReward } from '../models/user-reward.model';
import { Reward } from '../models/reward.model';
import { Salary } from '../models/salary.model';
import { Task } from '../models/task.model';
import { Target } from '../models/target.model';
import { Point } from '../models/point.model';
import { Commission } from '../models/commission.model';
import { CommissionRequest } from '../models/commission-request.model';
import { Invoice } from '../models/invoice.model';
import { Punishment } from '../models/punishments.model';
import { PunishmentRequest } from '../models/punishment-request.model';
import { Product } from '../models/product.model';
import { MedicineCategory } from '../models/medicine_category.model';
import { pointsRequest } from '../models/point-request.model';
import { SalaryHistory } from '../models/salary-history.model';

export const dataSource = new DataSource({
  type: 'postgres',
  host: env.postgres.host,
  port: env.postgres.port,
  username: env.postgres.username,
  password: env.postgres.password,
  database: env.postgres.database,
  entities: [
    UserAuth,
    Role,
    City,
    Country,
    AllowedVisitTime,
    AuditLog,
    DoctorReservation,
    Permission,
    State,
    UserProfileCompany,
    UserProfileDoctor,
    UserProfilePharmacy,
    DoctorSpecialty,
    RolePermission,
    Article,
    ArticleSpecialization,
    ArticleAction,
    ArticleComment,
    ArticleCommentAction,
    Vacation,
    VacationRequest,
    Reward,
    UserReward,
    Reward,
    UserReward,
    Salary,
    SalaryHistory,
    Task,
    Target,
    Point,
    Commission,
    CommissionRequest,
    Invoice,
    pointsRequest,
    Punishment,
    PunishmentRequest,
    MedicineCategory,
    Product,
  ],
  synchronize: true,
  logging: false,
});

export const initializeDB = async () => {
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    logger.error('Error during Data Source initialization:', err);
  }
};
