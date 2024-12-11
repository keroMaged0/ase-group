import { Errors } from '../../errors/index';
import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { UserAuth } from '../../models/user-auth.model';
import { dataSource } from '../../config/typeorm';
import { Role } from '../../models/role.model';
import { ErrCodes } from '../../types/error-code';

export const deleteRoleHandler: RequestHandler<{ role_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { role_id } = req.params;
  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(UserAuth);

  // Check if there are users associated with this role
  const usersWithRoleCounter = await userRepository.count({
    where: { role_id: { id: role_id } },
  });
  if (usersWithRoleCounter > 0)
    return next(new Errors.NotAllowed(ErrCodes.ROLE_IS_ASSOCIATED_TO_OTHER_USERS));

  const deletedRole = await roleRepository.delete({
    id: role_id,
    provider: { id: req.loggedUser.provider_id },
  });
  if (deletedRole.affected === 0) return next(new Errors.NotFound(ErrCodes.ROLE_NOT_FOUND));

  return res.json({
    success: true,
    message: 'Role deleted successfully',
    data: null,
  });
};
