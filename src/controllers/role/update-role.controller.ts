import { RequestHandler } from 'express';
import { In } from 'typeorm';

import { Permission } from '../../models/permission.model';
import { SuccessResponse } from '../../types/responses';
import { NotFound } from '../../errors/notfound-error';
import { dataSource } from '../../config/typeorm';
import { Role } from '../../models/role.model';
import { Errors } from '../../errors';
import { ErrCodes } from '../../types/error-code';
import { RolePermission } from '../../models/role_permissions.model';
interface UpdateRoleRequestBody {
  description?: string;
  permissions?: string[];
}

export const updateRoleHandler: RequestHandler<
  { role_id: string },
  SuccessResponse,
  UpdateRoleRequestBody
> = async (req, res, next) => {
  const { description, permissions } = req.body;
  const { role_id } = req.params;
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const rolePermRepo = dataSource.getRepository(RolePermission);

  const role = await roleRepository.findOne({
    where: { id: role_id, provider: { id: req.loggedUser.provider_id } },
  });
  if (!role) return next(new NotFound(ErrCodes.ROLE_NOT_FOUND));

  const permissionsToAdd =
    permissions && permissions.length > 0
      ? await permissionRepository.find({
          where: { key: In(permissions) },
        })
      : [];

  if (description) {
    const updatedRole = await roleRepository.update(
      { id: role_id, provider: { id: req.loggedUser.provider_id } },
      { description },
    );
    if (updatedRole.affected === 0) return next(new Errors.NotFound(ErrCodes.ROLE_NOT_FOUND));
  }
  if (permissions) {
    await rolePermRepo.delete({ role_id: { id: role_id } });
    await rolePermRepo.save(
      permissionsToAdd.map((permission) => ({
        role_id: { id: role_id },
        permission_key: permission,
      })),
    );
  }

  return res.json({
    success: true,
    message: 'Role updated successfully',
    data: {},
  });
};
