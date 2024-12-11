import { RequestHandler } from 'express';
import { In } from 'typeorm';

import { Permission } from '../../models/permission.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Role } from '../../models/role.model';
import { RolePermission } from '../../models/role_permissions.model';
interface CreateRoleRequestBody {
  key: string;
  description: string;
  permissions: string[];
}

export const createRoleHandler: RequestHandler<
  unknown,
  SuccessResponse,
  CreateRoleRequestBody
> = async (req, res, next) => {
  const { key, description, permissions } = req.body;
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const rolePermRepo = dataSource.getRepository(RolePermission);

  const newRole = await roleRepository.save({
    key,
    description,
    provider: { id: req.loggedUser.provider_id },
  });
  const permissionsToAdd = await permissionRepository.find({
    where: { id: In(permissions) },
    select: ['key'],
  });
  await rolePermRepo.save(
    permissionsToAdd.map((permission) => ({ role: newRole, permission_key: permission })),
  );

  return res.json({
    success: true,
    message: 'Role created successfully',
    data: newRole,
  });
};
