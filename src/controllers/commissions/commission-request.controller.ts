import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import {
  CommissionRequest,
  CommissionRequestStatus,
  CollectType,
} from '../../models/commission-request.model';
import { NotFound } from '../../errors/notfound-error';
import { ErrCodes } from '../../types/error-code';
import { SuccessResponse, PaginationResponse } from '../../types/responses';
import { Errors } from '../../errors';
import { Between, MoreThanOrEqual, LessThanOrEqual, ILike } from 'typeorm';

interface CreateCommissionRequestBody {
  commission_id: string;
  status: CommissionRequestStatus;
  target_user_id: string;
  collected_at: Date;
  collect_type: CollectType;
  invoice_id: string;
}

export const create: RequestHandler<unknown, SuccessResponse, CreateCommissionRequestBody> = async (
  req,
  res,
  next,
) => {
  const commissionRequestRepository = dataSource.getRepository(CommissionRequest);

  try {
    const newCommissionRequest = await commissionRequestRepository.save({
      commission: { id: req.body.commission_id },
      provider_id: { id: req.loggedUser.provider_id }, 
      created_by: { id: req.loggedUser.id }, 
      status: req.body.status,
      target_user: { id: req.body.target_user_id },
      collected_at: req.body.collected_at,
      collect_type: req.body.collect_type,
      invoice: { id: req.body.invoice_id },
    });
  

    res.status(201).json({
      success: true,
      message: 'Commission Request Created Successfully',
      data: newCommissionRequest,
    });
  } catch (error) {
    return next(new Errors.BadRequest(ErrCodes.BAD_REQUEST));
  }
};

export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    commission_id?: string;
    target_user_id?: string;
    status?: CommissionRequestStatus;
    collect_type?: CollectType;
    created_at_from?: Date;
    created_at_to?: Date;
  }
> = async (req, res, next) => {
  const filter: any = {};

  if (req.query.commission_id) filter.commission_id = req.query.commission_id;
  if (req.query.target_user_id) filter.target_user_id = req.query.target_user_id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.collect_type) filter.collect_type = req.query.collect_type;

  if (req.query.created_at_from && req.query.created_at_to) {
    filter.created_at = Between(req.query.created_at_from, req.query.created_at_to);
  } else if (req.query.created_at_from) {
    filter.created_at = MoreThanOrEqual(req.query.created_at_from);
  } else if (req.query.created_at_to) {
    filter.created_at = LessThanOrEqual(req.query.created_at_to);
  }

  req.pagination.filter = filter;
  next();
};

export const get: RequestHandler<unknown, PaginationResponse> = async (req, res, next) => {
  try {
    const commissionRequestRepository = dataSource.getRepository(CommissionRequest);

    const count = await commissionRequestRepository.count({
      where: {
        ...req.pagination.filter,
        provider_id: { id: req.loggedUser.provider_id },

      },
    });

    const commissionRequests = await commissionRequestRepository.find({
      where: {
        ...req.pagination.filter,
        provider_id: { id: req.loggedUser.provider_id },

      },
      relations: ['commission', 'created_by', 'target_user', 'invoice'],
      take: req.pagination.limit,
      skip: req.pagination.skip,
    });

    res.status(200).json({
      success: true,
      message: 'Commission requests retrieved successfully',
      pagination: {
        currentPage: req.pagination.page,
        totalPages: Math.ceil(count / req.pagination.limit),
        resultCount: count,
      },
      data: commissionRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const getOne: RequestHandler<{ id: string }, SuccessResponse> = async (req, res, next) => {
  try {
    const commissionRequestRepository = dataSource.getRepository(CommissionRequest);

    const commissionRequest = await commissionRequestRepository.findOne({
      where: {
        id: req.params.id,
        provider_id: { id: req.loggedUser.provider_id },

      },
      relations: ['commission', 'created_by', 'target_user', 'invoice'],
    });

    if (!commissionRequest) {
      return next(new NotFound(ErrCodes.NOT_FOUND));
    }

    res.status(200).json({
      success: true,
      message: 'Commission request retrieved successfully',
      data: commissionRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler<{ id: string }, SuccessResponse> = async (req, res, next) => {
  const { id } = req.params;
  const { commission_id, status, target_user_id, collected_at, collect_type, invoice_id } = req.body;

  const commissionRequestRepository = dataSource.getRepository(CommissionRequest);

  const commissionRequestToUpdate = await commissionRequestRepository.findOne({
    where: {
      id,
      provider_id: { id: req.loggedUser.provider_id },

    },
  });

  if (!commissionRequestToUpdate) {
    return next(new NotFound(ErrCodes.NOT_FOUND));
  }

  await commissionRequestRepository.update(id, {
    ...(commission_id && { commission: { id: commission_id } }),
    ...(status && { status }),
    ...(target_user_id && { target_user: { id: target_user_id } }),
    ...(collected_at && { collected_at }),
    ...(collect_type && { collect_type }),
    ...(invoice_id && { invoice: { id: invoice_id } }),
  });

  const updatedCommissionRequest = await commissionRequestRepository.findOne({
    where: {
      id,
      provider_id: { id: req.loggedUser.provider_id },
 
    },
    relations: ['commission', 'created_by', 'target_user', 'invoice'],
  });

  return res.status(200).json({
    success: true,
    message: 'Commission Request Updated Successfully',
    data: updatedCommissionRequest,
  });
};

export const remove: RequestHandler<{ id: string }, SuccessResponse> = async (req, res, next) => {
  const commissionRequestRepository = dataSource.getRepository(CommissionRequest);

  const commissionRequestToDelete = await commissionRequestRepository.findOne({
    where: {
      id: req.params.id,
      provider_id: { id: req.loggedUser.provider_id },

    },
  });

  if (!commissionRequestToDelete) {
    return next(new NotFound(ErrCodes.NOT_FOUND));
  }

  await commissionRequestRepository.delete({ id: req.params.id });

  return res.status(200).json({
    success: true,
    message: 'Commission Request Deleted Successfully',
    data: null,
  });
};



// export const get: RequestHandler<{ id?: string }, SuccessResponse> = async (req, res, next) => {
//   const { id } = req.params;
//   const commissionRequestRepository = dataSource.getRepository(CommissionRequest);

//   if (id) {
//     const commissionRequest = await commissionRequestRepository.findOne({
//       where: {
//         id,
//         provider_id: { id: req.loggedUser.provider_id }, 
//       },
//       relations: ['commission', 'created_by', 'target_user', 'invoice'],
//     });

//     if (!commissionRequest) {
//       return next(new NotFound(ErrCodes.NOT_FOUND));
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Commission Request retrieved successfully',
//       data: commissionRequest,
//     });
//   }

//   const commissionRequests = await commissionRequestRepository.find({
//     where: { provider_id: { id: req.loggedUser.provider_id } }, 
//     relations: ['commission', 'created_by', 'target_user', 'invoice'],
//   });

//   return res.status(200).json({
//     success: true,
//     message: 'All Commission Requests retrieved successfully',
//     data: commissionRequests,
//   });
// };

