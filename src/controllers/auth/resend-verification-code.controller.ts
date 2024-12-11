import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { UserAuth } from '../../models/user-auth.model';
import { Errors } from '../../errors';
import { ErrCodes } from '../../types/error-code';
import { Utils } from '../../utils';

export const resendVerificationCode: RequestHandler = async (req, res, next) => {
  const UserRepo = dataSource.getRepository(UserAuth);
  const user = await UserRepo.findOne({
    where: { email: req.body.email },
  });
  if (!user) return next(new Errors.NotFound(undefined, req.language));
  const currentTime = Date.now();
  const expireTime = new Date(user.verification_expire_at || '0').getTime();
  const remainingTimeToResendInSec = Math.floor((expireTime - currentTime) / 1000);

  if (!user.verification_reason)
    return next(new Errors.BadRequest(ErrCodes.NO_REASON_TO_RESEND_CODE, req.language));
  if (currentTime < expireTime)
    return res.status(200).json({
      status: false,
      message: 'You have to wait before sending the code again',
      data: {
        remainingTime: remainingTimeToResendInSec,
      },
    });

  const expireAt = new Date(Date.now() + 10 * 60 * 1000);
  const code = await Utils.Crypto.generateCode();

  await UserRepo.update(
    { id: user.id },
    { verification_code: Utils.Crypto.hashCode(code), verification_expire_at: expireAt },
  );

  // TODO: send code to user email

  res.status(200).json({
    status: true,
    message: 'Code sent Successfully',
    data: {
      expireAt,
      reason: user.verification_reason,
    },
  });
};
