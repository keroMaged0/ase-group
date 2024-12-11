import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { UserAuth } from '../../models/user-auth.model';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { Utils } from '../../utils';
import { VerifyReason } from '../../types/verify-reason';
import { env } from '../../config/env';

export const askForgetPasswordHandler: RequestHandler<
  unknown,
  SuccessResponse,
  { email: string }
> = async (req, res, next) => {
  const UserRepo = dataSource.getRepository(UserAuth);
  const user = await UserRepo.findOne({
    where: { email: req.body.email },
    select: ['is_verified'],
  });
  if (!user) return next(new Errors.BadRequest(ErrCodes.EMAIL_NOT_FOUND, req.language));

  if (user.is_verified === false)
    return next(new Errors.BadRequest(ErrCodes.USER_NOT_VERIFIED, req.language));

  const code = await Utils.Crypto.generateCode();
  const expirTime = new Date(Date.now() + 10 * 60 * 1000);

  await UserRepo.update(
    { email: req.body.email },
    {
      verification_code: Utils.Crypto.hashCode(code),
      verification_expire_at: expirTime,
      verification_reason: VerifyReason.updatePassword,
    },
  );

  //TODO: send email with code
  return res.status(200).json({
    success: true,
    message: 'Verification code has been sent to your email',
    data: {},
  });
};

export const updateForgetenPasswordHandler: RequestHandler<
  unknown,
  SuccessResponse,
  { email: string; new_password: string }
> = async (req, res, next) => {
  const UserRepo = dataSource.getRepository(UserAuth);
  const user = await UserRepo.findOne({ where: { email: req.body.email } });
  if (!user) return next(new Errors.BadRequest(ErrCodes.INVALID_CREDINTIALS));

  if (user.verification_reason !== VerifyReason.updatePasswordVerified)
    return next(new Errors.BadRequest(ErrCodes.VERIFICATION_CODE_NOT_VERIFIED, req.language));

  user.token = Utils.Tokens.generateRefreshToken({ id: user.id });
  user.password = await Utils.Bcrypt.hashPwd(
    req.body.new_password,
    env.bcrypt.salt,
    env.bcrypt.paper,
  );
  user.verification_code = null as any;
  user.verification_expire_at = null as any;
  user.verification_reason = null as any;

  await UserRepo.save(user);

  return res.status(200).json({
    success: true,
    message: 'Password has been updated successfully',
    data: {},
  });
};
