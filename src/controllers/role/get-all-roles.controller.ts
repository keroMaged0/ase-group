import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Role } from '../../models/role.model';

export const getAllRolesHandler: RequestHandler<unknown, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const roleRepository = dataSource.getRepository(Role);

  const rolesWithPermissionCount = await roleRepository
    .createQueryBuilder('role')
    .leftJoinAndSelect('role.role_permissions', 'role_permission')
    .where('role.provider_id = :provider_id', { provider_id: req.loggedUser.provider_id })
    .orWhere('role.provider_id IS NULL')
    .select('role.id', 'id')
    .addSelect('role.key', 'key')
    .addSelect('role.description', 'description')
    .addSelect('COUNT(role_permission.permission_key)', 'permission_count')
    .groupBy('role.id')
    .addGroupBy('role.key')
    .addGroupBy('role.description')
    .getRawMany();

  return res.json({
    success: true,
    message: 'Roles fetched successfully',
    data: rolesWithPermissionCount,
  });
};
