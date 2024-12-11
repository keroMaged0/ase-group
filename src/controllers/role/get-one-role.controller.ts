import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { NotFound } from '../../errors/notfound-error';
import { ErrCodes } from '../../types/error-code';
import { RolePermission } from '../../models/role_permissions.model';

export const getRoleByIdHandler: RequestHandler<{ role_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { role_id } = req.params;

  const role = await dataSource
    .getRepository(Role)
    .createQueryBuilder('role')
    .where('role.id = :role_id', { role_id })
    .andWhere('(role.provider_id = :provider_id OR role.provider_id IS NULL)', {
      provider_id: req.loggedUser.provider_id,
    })
    .getOne();
  if (!role) return next(new NotFound(ErrCodes.ROLE_NOT_FOUND, req.language));

  const permissionsHierarchy = await dataSource.query(
    `
    WITH active_permissions AS (
      SELECT 
        p.id AS permission_id,
        p.key AS permission_key,
        p.parent_id AS parent_permission_id,
        p.description as description,
        CASE WHEN rp.permission_key IS NOT NULL THEN true ELSE false END AS is_active
      FROM 
        permission p
      LEFT JOIN 
        role_permission rp ON rp.permission_key = p.key AND rp.role_id = $1
    )
    SELECT 
      ap.permission_id as id,
      ap.permission_key as key,
      ap.description as description,
      ap.is_active,
      ARRAY(
        SELECT json_build_object(
          'id', child.permission_id,
          'key', child.permission_key,
          'description', child.description,
          'is_active', child.is_active
        )
        FROM active_permissions child
        WHERE child.parent_permission_id = ap.permission_id
      ) AS children
    FROM 
      active_permissions ap
    WHERE 
      ap.parent_permission_id IS NULL;
    `,
    [role_id],
  );

  if (!permissionsHierarchy) return next(new NotFound(ErrCodes.ROLE_NOT_FOUND, req.language));
  return res.json({
    success: true,
    message: 'role fetched successfully',
    data: { ...role, permissions: permissionsHierarchy },
  });
};
