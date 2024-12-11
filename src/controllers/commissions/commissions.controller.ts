import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { Commission, CommissionType } from '../../models/commission.model';
import { NotFound } from '../../errors/notfound-error';
import { ErrCodes } from '../../types/error-code';
import { PaginationResponse, SuccessResponse } from '../../types/responses';
import { Between, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { env } from '../../config/env';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../constants/query';

interface CreateCommissionBody {
  title: string;
  description: string;
  percentage: number;
  collection_duration_days: number;
  commission_type: CommissionType;
}

export const create: RequestHandler<unknown, SuccessResponse, CreateCommissionBody> = async (
  req,
  res,
  next,
) => {
  const commission = await dataSource.getRepository(Commission).save({
    ...req.body,
    provider_id: { id: req.loggedUser.provider_id },
    created_by: { id: req.loggedUser.id },
  });

  res.status(201).json({
    success: true,
    message: 'Commission Created Successfully',
    data: commission,
  });
};

export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    title?: string;
    commission_type?: CommissionType;
    percentage_from?: number;
    percentage_to?: number;
    created_at_from: Date;
    created_at_to: Date;
    created_by?: string;
  }
> = async (req, res, next) => {
  const filter: FindOptionsWhere<Commission> = req.pagination.filter;
  if (req.query.title) filter.title = ILike(`%${req.query.title}%`);
  if (req.query.commission_type !== undefined) filter.commission_type = req.query.commission_type;
  if (req.query.percentage_from && req.query.percentage_to) {
    filter.percentage = Between(req.query.percentage_from, req.query.percentage_to);
  } else if (req.query.percentage_from || req.query.percentage_to) {
    if (req.query.percentage_from !== undefined) {
      filter.percentage = MoreThanOrEqual(req.query.percentage_from);
    }
    if (req.query.percentage_to !== undefined) {
      filter.percentage = LessThanOrEqual(req.query.percentage_to);
    }
  }
  if (req.query.created_at_from && req.query.created_at_to) {
    filter.created_at = Between(req.query.created_at_from, req.query.created_at_to);
  } else if (req.query.created_at_from || req.query.created_at_to) {
    if (req.query.created_at_from !== undefined) {
      filter.created_at = MoreThanOrEqual(req.query.created_at_from);
    }
    if (req.query.created_at_to !== undefined) {
      filter.created_at = LessThanOrEqual(req.query.created_at_to);
    }
  }
  if (req.query.created_by) filter.created_by = { id: req.query.created_by };
  req.pagination.filter = filter;
  next();
};

export const get: RequestHandler<unknown, PaginationResponse> = async (req, res, next) => {
  const commissionsCount = await dataSource
    .getRepository(Commission)
    .count({ where: req.pagination.filter });

  const commissions = await dataSource
    .getRepository(Commission)
    .createQueryBuilder('commission')
    .leftJoinAndSelect('commission.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select(['commission', ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
    ])
    .where('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .andWhere(req.pagination.filter)
    .take(req.pagination.limit)
    .skip(req.pagination.skip)
    .getMany();

    commissions.forEach((c: any) => {
      if (c.created_by.user_company_profile === null) c.created_by.user_company_profile = undefined;
      if (c.created_by.user_pharmacy_profile === null) c.created_by.user_pharmacy_profile = undefined;
      if (c.created_by.user_doctor_profile === null) c.created_by.user_doctor_profile = undefined;
      if (c.created_by.user_company_profile)
        c.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${c.created_by.user_company_profile.profile_image}`;
      if (c.created_by.user_pharmacy_profile)
        c.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${c.created_by.user_pharmacy_profile.profile_image}`;
      if (c.created_by.user_doctor_profile)
        c.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${c.created_by.user_doctor_profile.profile_image}`;
      c.commission_type = CommissionType[c.commission_type];
    });

  res.status(200).json({
    success: true,
    message: 'Commissions retrieved successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(commissionsCount / req.pagination.limit),
      resultCount: commissionsCount,
    },
    data: commissions,
  });
};

export const getOne: RequestHandler<{ commissionId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const commission = await dataSource
    .getRepository(Commission)
    .createQueryBuilder('commission')
    .leftJoinAndSelect('commission.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select(['commission', ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
    ])
    .where('commission.id = :commissionId', { commissionId: req.params.commissionId })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();

  if (!commission) return next(new NotFound(ErrCodes.NOT_FOUND));

    if (commission.created_by.user_company_profile === null)
      (commission as any).created_by.user_company_profile = undefined;
    if (commission.created_by.user_pharmacy_profile === null)
      (commission as any).created_by.user_pharmacy_profile = undefined;
    if (commission.created_by.user_doctor_profile === null)
      (commission as any).created_by.user_doctor_profile = undefined;
    if (commission.created_by.user_company_profile)
      commission.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${commission.created_by.user_company_profile.profile_image}`;
    if (commission.created_by.user_pharmacy_profile)
      commission.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${commission.created_by.user_pharmacy_profile.profile_image}`;
    if (commission.created_by.user_doctor_profile)
      commission.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${commission.created_by.user_doctor_profile.profile_image}`;
    (commission as any).commission_type = CommissionType[(commission as any).commission_type];
  
  res.status(200).json({
    success: true,
    message: 'Commission retrieved successfully',
    data: commission,
  });
};

export const update: RequestHandler<{ commissionId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const commission = await dataSource
    .getRepository(Commission)
    .createQueryBuilder('commission')
    .select('commission.id')
    .where('commission.id = :commissionId', { commissionId: req.params.commissionId })
    .andWhere('commission.provider_id = :providerId', { providerId: req.loggedUser.provider_id })
    .getOne();

  if (!commission) return next(new NotFound(ErrCodes.NOT_FOUND));

  await dataSource.getRepository(Commission).update({ id: req.params.commissionId }, req.body);

  res.status(200).json({
    success: true,
    message: 'Commission updated successfully',
    data: {},
  });
};

export const remove: RequestHandler<{ commissionId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const commission = await dataSource
    .getRepository(Commission)
    .createQueryBuilder('commission')
    .select('commission.id')
    .where('commission.id = :commissionId', { commissionId: req.params.commissionId })
    .andWhere('commission.provider_id = :providerId', { providerId: req.loggedUser.provider_id })
    .getOne();

  if (!commission) return next(new NotFound(ErrCodes.NOT_FOUND));

  await dataSource.getRepository(Commission).delete({ id: req.params.commissionId });

  res.status(200).json({
    success: true,
    message: 'Commission Deleted Successfully',
    data: {},
  });
};

// import { RequestHandler } from 'express';
// import { dataSource } from '../../config/typeorm';
// import { Commission, CommissionType } from '../../models/commission.model';
// import { UserAuth } from '../../models/user-auth.model';
// import { NotFound } from '../../errors/notfound-error';
// import { ErrCodes } from '../../types/error-code';
// import { SuccessResponse, PaginationResponse } from '../../types/responses';
// import { Between, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
// import { Errors } from '../../errors';

// interface CreateCommissionBody {
//   title: string;
//   description: string;
//   percentage: number;
//   collection_duration_days: number;
//   commission_type: CommissionType;
// }

// export const create: RequestHandler<unknown, SuccessResponse, CreateCommissionBody> = async (
//   req,
//   res,
//   next,
// ) => {
//   const commission = await dataSource.getRepository(Commission).save({
//     ...req.body,
//     provider_id: { id: req.loggedUser.provider_id },
//     created_by: { id: req.loggedUser.id },
//   });


//   res.status(201).json({
//     success: true,
//     message: 'commissions Created Successfully',
//     data: commission,
//   });

// };

// export const getPagination: RequestHandler<
//   unknown,
//   unknown,
//   unknown,
//   {
//     title?: string;
//     commission_type?: CommissionType;
//     created_at_from: Date;
//     created_at_to: Date;
//     created_by?: string;
//   }
// > = async (req, res, next) => {
//   const filter: FindOptionsWhere<Commission> = {
//     provider_id: { id: req.loggedUser.provider_id },
//   };

//   if (req.query.title) filter.title = ILike(`%${req.query.title}%`);
//   if (req.query.commission_type !== undefined) filter.commission_type = req.query.commission_type;
  
//   if (req.query.created_at_from && req.query.created_at_to) {
//     filter.created_at = Between(req.query.created_at_from, req.query.created_at_to);
//   } else if (req.query.created_at_from || req.query.created_at_to) {
//     if (req.query.created_at_from !== undefined) {
//       filter.created_at = MoreThanOrEqual(req.query.created_at_from);
//     }
//     if (req.query.created_at_to !== undefined) {
//       filter.created_at = LessThanOrEqual(req.query.created_at_to);
//     }
//   }

//   if (req.query.created_by) filter.created_by = { id: req.query.created_by };
//   req.pagination.filter = filter; 
//   next();
// };

// export const get: RequestHandler<unknown, PaginationResponse> = async (req, res, next) => {
//   const commissionsCount = await dataSource
//     .getRepository(Commission)
//     .count({ where: req.pagination.filter });
//   const commissions = await dataSource.getRepository(Commission).find({
//     where: { ...req.pagination.filter, provider_id: { id: req.loggedUser.provider_id } },
//     loadRelationIds: true,
//     take: req.pagination.limit,
//     skip: req.pagination.skip,
//   });
//   res.status(200).json({
//     success: true,
//     message: 'Commissions retrieved successfully',
//     pagination: {
//       currentPage: req.pagination.page,
//       totalPages: Math.ceil(commissionsCount / req.pagination.limit),
//       resultCount: commissionsCount,
//     },
//     data: commissions,
//   });
// };

// export const getOne: RequestHandler<{ commissionId: string }, SuccessResponse> = async (
//   req,
//   res,
//   next,
// ) => {
//   const commission = await dataSource.getRepository(Commission).findOne({
//     where: { id: req.params.commissionId, provider_id: { id: req.loggedUser.provider_id } },
//     loadRelationIds: true,
//   });

//   if (!commission) return next(new NotFound(ErrCodes.NOT_FOUND));

//   res.status(200).json({
//     success: true,
//     message: 'Commission retrieved successfully',
//     data: commission,
//   });
// };

// export const update: RequestHandler<{ commissionId: string }, SuccessResponse> = async (req, res, next) => {
//   const vacation = await dataSource
//     .getRepository(Commission)
//     .update({ id: req.params.commissionId }, req.body);
//   if (vacation.affected === 0) return next(new NotFound(ErrCodes.NOT_FOUND, req.language));
//   res.status(200).json({
//     success: true,
//     message: 'Commission updated successfully',
//     data: {},
//   });
// };

// export const remove: RequestHandler<{ id: string }, SuccessResponse> = async (req, res, next) => {
//   const commissionRepository = dataSource.getRepository(Commission);
//   const commissionToDelete = await commissionRepository.findOneBy({ id: req.params.id });
//   if (!commissionToDelete) return next(new NotFound(ErrCodes.NOT_FOUND));

//   await commissionRepository.delete({ id: req.params.id });

//   return res.status(200).json({
//     success: true,
//     message: 'Commission Deleted Successfully',
//     data: null,
//   });
// };
