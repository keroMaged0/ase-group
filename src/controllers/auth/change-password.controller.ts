import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { UserAuth } from '../../models/user-auth.model';
import { Utils } from '../../utils';
import { Errors } from '../../errors';
import { ErrCodes } from '../../types/error-code';
import { env } from '../../config/env';

export const changePasswordHandler: RequestHandler<
  unknown,
  SuccessResponse,
  {
    old_password: string;
    new_password: string;
  }
> = async (req, res, next) => {
  const UserRepo = dataSource.getRepository(UserAuth);
  const user = await UserRepo.findOne({ where: { id: req.loggedUser.id }, select: ['password'] });
  const isMatch = await Utils.Bcrypt.comparePwd(
    req.body.old_password,
    user!.password,
    env.bcrypt.paper,
  );
  if (!isMatch) return next(new Errors.BadRequest(ErrCodes.INVALID_CREDINTIALS, req.language));
  const hashedPwd = await Utils.Bcrypt.hashPwd(
    req.body.new_password,
    env.bcrypt.salt,
    env.bcrypt.paper,
  );
  await UserRepo.update({ id: req.loggedUser.id }, { password: hashedPwd });
  res.send({ success: true, message: 'Password has been changed successfully', data: {} });
};
