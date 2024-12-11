import { RequestHandler } from 'express';
import { FindOptionsWhere } from 'typeorm';
import { dataSource } from '../../config/typeorm';
import { UserAuth, UserType } from '../../models/user-auth.model';
import { env } from '../../config/env';
import { PaginationResponse, SuccessResponse } from '../../types/responses';
import { NotFound } from '../../errors/notfound-error';

export const findUsersPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    id?: string;
    email?: string;
    phone?: string;
    name?: string;
    job_title?: string;
    user_type?: UserType;
  }
> = async (req, res, next) => {
  const filter: FindOptionsWhere<UserAuth> = {};
  if (req.query.id) filter.id = req.query.id;
  if (req.query.email) filter.email = req.query.email;
  if (req.query.phone) filter.phone = req.query.phone;
  if (req.query.job_title) filter.job_title = req.query.job_title;
  if (req.query.user_type !== undefined) filter.user_type = req.query.user_type;
  req.pagination.filter = filter;
  next();
};

export const findUsers: RequestHandler<unknown, PaginationResponse> = async (req, res, next) => {
  req.pagination.filter.is_verified = true;
  req.pagination.filter.is_verified_by_crm = true;
  const filterByNameQuery =
    'user_company_profile.first_name ILIKE :name OR user_company_profile.middle_name ILIKE :name OR user_company_profile.last_name ILIKE :name OR user_pharmacy_profile.name ILIKE :name OR user_doctor_profile.first_name ILIKE :name OR user_doctor_profile.middle_name ILIKE :name OR user_doctor_profile.last_name ILIKE :name';

  const countQueryBuilder = dataSource
    .getRepository(UserAuth)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('user.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('user.user_doctor_profile', 'user_doctor_profile')
    .where(req.pagination.filter)
    .andWhere(
      `user.account_provider_id = '${req.loggedUser.provider_id}' OR account_provider_id = user.id`,
    );

  if (req.query.name) countQueryBuilder.andWhere(filterByNameQuery, { name: `${req.query.name}%` });

  const count = await countQueryBuilder.getCount();

  const usersQueryBuilder = dataSource
    .getRepository(UserAuth)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('user.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('user.user_doctor_profile', 'user_doctor_profile')
    .select([
      'user.id',
      'user.email',
      'user.phone',
      'user.user_type',
      'user.created_at',
      'user.job_title',
      'user_company_profile.first_name',
      'user_company_profile.middle_name',
      'user_company_profile.last_name',
      'user_company_profile.profile_image',
      'user_pharmacy_profile.name',
      'user_pharmacy_profile.profile_image',
      'user_doctor_profile.first_name',
      'user_doctor_profile.middle_name',
      'user_doctor_profile.last_name',
      'user_doctor_profile.profile_image',
    ])
    .where(req.pagination.filter)
    .andWhere(
      `CASE WHEN user.user_type = 0 THEN (user.account_provider_id = '${req.loggedUser.provider_id}' OR account_provider_id = user.id) ELSE TRUE END`,
    );
  if (req.query.name) usersQueryBuilder.andWhere(filterByNameQuery, { name: `${req.query.name}%` });

  usersQueryBuilder.take(req.pagination.limit).skip(req.pagination.skip);
  const users = await usersQueryBuilder.getMany();

  users.forEach((user: any) => {
    if (user.user_company_profile === null) user.user_company_profile = undefined;
    if (user.user_pharmacy_profile === null) user.user_pharmacy_profile = undefined;
    if (user.user_doctor_profile === null) user.user_doctor_profile = undefined;
    if (user.user_company_profile?.profile_image != undefined)
      user.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${user.user_company_profile.profile_image}`;
    if (user.user_pharmacy_profile?.profile_image != undefined)
      user.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${user.user_pharmacy_profile.profile_image}`;
    if (user.user_doctor_profile?.profile_image != undefined)
      user.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${user.user_doctor_profile.profile_image}`;
    user.user_type = UserType[user.user_type];
  });

  res.status(200).json({
    success: true,
    message: 'data retreived',
    pagination: {
      currentPage: req.pagination.page,
      resultCount: count,
      totalPages: Math.ceil(count / req.pagination.limit),
    },
    data: users,
  });
};

export const findUser: RequestHandler<{ user_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const usersQueryBuilder = dataSource
    .getRepository(UserAuth)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('user.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('user.user_doctor_profile', 'user_doctor_profile')
    .select([
      'user.id',
      'user.email',
      'user.phone',
      'user.user_type',
      'user.job_title',
      'user.created_at',
      'user_company_profile.first_name',
      'user_company_profile.middle_name',
      'user_company_profile.last_name',
      'user_company_profile.profile_image',
      'user_pharmacy_profile.name',
      'user_pharmacy_profile.profile_image',
      'user_doctor_profile.first_name',
      'user_doctor_profile.middle_name',
      'user_doctor_profile.last_name',
      'user_doctor_profile.profile_image',
    ])
    .where({ id: req.params.user_id, is_verified: true, is_verified_by_crm: true })
    .andWhere(
      `user.account_provider_id = '${req.loggedUser.provider_id}' OR account_provider_id = user.id`,
    );

  const user = await usersQueryBuilder.getOne();
  if (!user) return next(new NotFound(undefined, req.language));

  if (user.user_company_profile === null) (user as any).user_company_profile = undefined;
  if (user.user_pharmacy_profile === null) (user as any).user_pharmacy_profile = undefined;
  if (user.user_doctor_profile === null) (user as any).user_doctor_profile = undefined;
  if (user.user_company_profile?.profile_image != undefined)
    user.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${user.user_company_profile.profile_image}`;
  if (user.user_pharmacy_profile?.profile_image != undefined)
    user.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${user.user_pharmacy_profile.profile_image}`;
  if (user.user_doctor_profile?.profile_image != undefined)
    user.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${user.user_doctor_profile.profile_image}`;
  (user as any).user_type = UserType[user.user_type];

  res.status(200).json({
    success: true,
    message: 'data retreived',
    data: user,
  });
};
