import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { UserAuth } from '../../models/user-auth.model';
import { SuccessResponse } from '../../types/responses';
import { Errors } from '../../errors';
import { ErrCodes } from '../../types/error-code';
import { Utils } from '../../utils';
import { env } from '../../config/env';
import { IjwtPayload } from '../../types/jwt-payload';

export const signinHandler: RequestHandler<
  unknown,
  SuccessResponse,
  {
    email: string;
    password: string;
  }
> = async (req, res, next) => {
  const userRepo = dataSource.getRepository(UserAuth);
  const user = await userRepo.findOne({ where: { email: req.body.email }, loadRelationIds: true });
  if (!user) return next(new Errors.BadRequest(ErrCodes.INVALID_CREDINTIALS, req.language));

  const isPwdMatch = await Utils.Bcrypt.comparePwd(
    req.body.password,
    user.password,
    env.bcrypt.paper,
  );
  if (!isPwdMatch) return next(new Errors.BadRequest(ErrCodes.INVALID_CREDINTIALS, req.language));
  // if (!user.is_verified)
  //   return next(new Errors.BadRequest(ErrCodes.USER_NOT_VERIFIED, req.language));
  // if (!user.is_verified_by_crm)
  //   return next(new Errors.BadRequest(ErrCodes.USER_NOT_VERIFIED_BY_CRM, req.language));

  if (!user.token || !Utils.Tokens.isValidToken(user.token)) {
    const token = Utils.Tokens.generateRefreshToken({ id: user.id });
    user.token = token;
    await userRepo.save(user);
  }

  const accessToken = Utils.Tokens.generateAccessToken({
    id: user.id,
    role_id: user.role_id as unknown as string,
    is_verified: user.is_verified,
    user_type: user.user_type,
    provider_id: user.account_provider_id as unknown as string,
    profile_id:
      (user.user_company_profile as unknown as string) ||
      (user.user_doctor_profile as unknown as string) ||
      (user.user_pharmacy_profile as unknown as string),
  } as IjwtPayload);

  res.status(200).json({
    success: true,
    message: 'signin successfully',
    data: { access_token: accessToken, refresh_token: user.token },
  });
};
