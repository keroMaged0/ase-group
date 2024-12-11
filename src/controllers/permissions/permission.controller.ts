import { RequestHandler } from 'express';

import { Permission } from '../../models/permission.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { ErrCodes } from '../../types/error-code';

export const get: RequestHandler<unknown, SuccessResponse> = async (req, res, next) => {
  const permissionRepo = dataSource.getRepository(Permission);
  const permissions = await permissionRepo.query(
    'select id, key, description, parent_id, created_at, updated_at from permission',
  );

  permissions.forEach((el) => {
    if (el.parent_id) {
      const parent = permissions.find((p) => p.id === el.parent_id);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(el);
      }
    }
  });

  return res.json({
    success: true,
    message: 'Permissions retrieved successfully',
    data: permissions,
  });
};

export const update: RequestHandler<
  { permission_id: string },
  SuccessResponse,
  {
    description: string;
  }
> = async (req, res, next) => {
  const permissionRepository = dataSource.getRepository(Permission);
  const permission = await permissionRepository.update(
    { id: req.params.permission_id },
    {
      description: req.body.description,
    },
  );
  if (permission.affected === 0) return next(new Errors.NotFound(ErrCodes.PERMISSION_NOT_FOUND));

  return res.json({
    success: true,
    message: 'Permission updated successfully',
    data: permission,
  });
};

export const getLoggedUserPermissions: RequestHandler<unknown, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  res.status(200).json({ success: true, message: 'success', data: req.loggedUser.permissions });
};
