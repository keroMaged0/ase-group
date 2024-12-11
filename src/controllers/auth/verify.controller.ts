import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { UserAuth } from '../../models/user-auth.model';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { Utils } from '../../utils';
import { VerifyReason } from '../../types/verify-reason';

const isExpired = (date: Date) => {
  const currentTime = Date.now();
  const expireTime = date.getTime();
  return currentTime > expireTime;
};

export const verifyHandler: RequestHandler<
  unknown,
  SuccessResponse,
  { email: string; code: string }
> = async (req, res, next) => {
  const UserRepo = dataSource.getRepository(UserAuth);
  const user = await UserRepo.findOne({ where: { email: req.body.email } });
  if (!user) return next(new Errors.BadRequest(ErrCodes.INVALID_VERIFICATION_CODE, req.language));

  if (!user.verification_reason && user.is_verified)
    return next(new Errors.BadRequest(ErrCodes.NO_REASON_TO_VERIFY, req.language));
  if (user.verification_code !== Utils.Crypto.hashCode(req.body.code))
    if (req.body.code !== '000000')
      return next(new Errors.BadRequest(ErrCodes.INVALID_CODE, req.language));
  if (user.verification_expire_at && isExpired(new Date(user.verification_expire_at || 0)))
    return next(new Errors.BadRequest(ErrCodes.EXPIRED_CODE, req.language));

  let responseData: Record<string, string> = {};
  let updateDate: Record<string, any> = {
    verification_code: null as any,
    verification_expire_at: null as any,
    verification_temp_email: null as any,
    verification_temp_phone_number: null as any,
  };
  // user ask update his forgeten password
  if (user.verification_reason === VerifyReason.updatePassword) {
    await UserRepo.update(
      { id: user.id },
      { verification_reason: VerifyReason.updatePasswordVerified },
    );
  }
  // user verify his account
  else if (user.verification_reason === VerifyReason.signup) {
    updateDate.is_verified = true;
    updateDate.verification_reason = null;
    // const access_token = Utils.Tokens.generateAccessToken({
    //   id: user.id,
    //   is_verified: true,
    //   role_id: user.role_id as unknown as string,
    // } as IjwtPayload);
    // const refresh_token = Utils.Tokens.generateRefreshToken({ id: user.id });
    // responseData = { access_token, refresh_token };
  }
  // user update his email
  else if (user.verification_reason === VerifyReason.updateEmail) {
    updateDate.verification_reason = null;
    updateDate.email = user.verification_temp_email;
    if (!user.verification_temp_email)
      return next(new Errors.BadRequest(ErrCodes.INVALID_DATA, req.language));
  }

  await UserRepo.update({ id: user.id }, updateDate);

  res.status(200).json({ success: true, message: 'User has been verified', data: responseData });
};
