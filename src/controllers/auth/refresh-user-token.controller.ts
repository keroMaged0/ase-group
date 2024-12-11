import { RequestHandler } from 'express';
import { Unauthenticated } from '../../errors/unauthenticated-error';
import { Tokens } from '../../utils/token';
import { dataSource } from '../../config/typeorm';
import { UserAuth } from '../../models/user-auth.model';
import { ErrCodes } from '../../types/error-code';
import { SuccessResponse } from '../../types/responses';
import { IjwtPayload } from '../../types/jwt-payload';
export const refreshUserToken: RequestHandler<unknown, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new Unauthenticated());
  const decoded = Tokens.verifyToken(token) as { id: string };
  if (!decoded) return next(new Unauthenticated());
  const user = await dataSource
    .getRepository(UserAuth)
    .findOne({ where: { id: decoded.id, token: token }, loadRelationIds: true });
  if (!user) return next(new Unauthenticated(ErrCodes.INVALID_TOKEN, req.language));
  const newToken = Tokens.generateAccessToken({
    id: user.id,
    role_id: user.role_id as unknown as string,
    is_verified: user.is_verified,
    user_type: user.user_type,
    provider_id: user.account_provider_id as unknown as string,
  } as IjwtPayload);
  res
    .status(200)
    .json({ success: true, message: 'token generated', data: { access_token: newToken } });
};
