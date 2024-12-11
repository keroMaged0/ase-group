import { RequestHandler } from 'express';
import { Utils } from '../utils';
import { IjwtPayload } from '../types/jwt-payload';
import { dataSource } from '../config/typeorm';
import { RolePermission } from '../models/role_permissions.model';

export const authentication: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  const payload = Utils.Tokens.verifyToken(token) as IjwtPayload;
  if (!payload) return next();

  const RolePermissionRepo = dataSource.getRepository(RolePermission);
  const permissions = await RolePermissionRepo.find({
    where: { role_id: { id: payload.role_id } },
    select: ['permission_key'],
    loadRelationIds: true,
  });
  req.loggedUser = {
    id: payload.id,
    is_verified: payload.is_verified,
    role_id: payload.role_id,
    user_type: +payload.user_type,
    permissions: permissions.map((el) => el.permission_key) as any,
    provider_id: payload.provider_id,
    profile_id: payload.profile_id,
  };
  next();
};
