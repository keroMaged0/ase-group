import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { UserAuth } from '../../models/user-auth.model';
import { Utils } from '../../utils';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { VerifyReason } from '../../types/verify-reason';

export const askChangeEmailHandler: RequestHandler<
  unknown,
  SuccessResponse,
  {
    email: string;
    password: string;
  }
> = async (req, res, next) => {
  const UserRepo = dataSource.getRepository(UserAuth);
  const user = await UserRepo.findOne({ where: { id: req.loggedUser.id }, select: ['password'] });
  const isMatch = await Utils.Bcrypt.comparePwd(req.body.password, user!.password);
  if (!isMatch) return next(new Errors.BadRequest(ErrCodes.INVALID_CREDINTIALS, req.language));

  if (await UserRepo.findOne({ where: { email: req.body.email } }))
    return next(new Errors.BadRequest(ErrCodes.EMAIL_ALREADY_EXISTS, req.language));

  const code = await Utils.Crypto.generateCode();
  const expirTime = new Date(Date.now() + 10 * 60 * 1000);

  await UserRepo.update(
    { id: req.loggedUser.id },
    {
      verification_code: Utils.Crypto.hashCode(code),
      verification_expire_at: expirTime,
      verification_reason: VerifyReason.updateEmail,
      verification_temp_email: req.body.email,
    },
  );
  // TODO: send code to new mail

  return res.status(200).json({
    success: true,
    message: 'Verification code has been sent to your new email',
    data: {},
  });
};
