import { RequestHandler } from 'express';
import { v4 } from 'uuid';
import { SuccessResponse } from '../../types/responses';
import { UserAuth, UserType } from '../../models/user-auth.model';
import { Utils } from '../../utils';
import { env } from '../../config/env';
import { dataSource } from '../../config/typeorm';
import { UserProfileCompany } from '../../models/user-profile-company.model';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { SystemRoles } from '../../types/system-roles';
import { Role } from '../../models/role.model';
import { UserProfileDoctor } from '../../models/user-profile-doctor.model';
import { UserProfilePharmacy } from '../../models/user-profile-pharmacy.model';
import { VerifyReason } from '../../types/verify-reason';
import { AllowedVisitTime } from '../../models/allowed-visit-times.model';
import { logger } from '../../config/winston';

interface IsignupCompanyHandlerBody {
  user_type: UserType.company;
  email: string;
  phone?: string;
  password: string;

  first_name?: string;
  middle_name?: string;
  last_name?: string;
  country_id: string;
  city_id: string;
  state_id: string;
  gender: boolean;
  birth_date?: Date;
  fcm_token?: string;
}

interface IsignupPharmacyHandlerBody {
  user_type: UserType.pharmacy;
  email: string;
  phone?: string;
  password: string;

  name?: string;
  country_id: string;
  city_id: string;
  state_id: string;
  owner_name: string;
  owner_phone_number: string;
  pharmacy_number: string;
  fcm_token?: string;
}

interface IsignupDoctorHandlerBody {
  user_type: UserType.doctor;
  email: string;
  phone?: string;
  password: string;

  firstName?: string;
  middleName?: string;
  lastName?: string;
  nickname?: string;
  gender: boolean;
  birth_date: Date;
  country_id: string;
  city_id: string;
  state_id: string;
  fcm_token?: string;
}

export const signupHandler: RequestHandler<
  unknown,
  SuccessResponse,
  IsignupCompanyHandlerBody | IsignupPharmacyHandlerBody | IsignupDoctorHandlerBody
> = async (req, res, next) => {
  const UserRepo = dataSource.getRepository(UserAuth);
  const UserCompanyProfileRepo = dataSource.getRepository(UserProfileCompany);
  const UserDoctorProfileRepo = dataSource.getRepository(UserProfileDoctor);
  const UserPharmacyProfileRepo = dataSource.getRepository(UserProfilePharmacy);

  const code = await Utils.Crypto.generateCode(3);
  const userId = v4();
  const hashedPwd = await Utils.Bcrypt.hashPwd(
    req.body.password,
    env.bcrypt.salt,
    env.bcrypt.paper,
  );

  // TODO: solve dynamic role based on dynamic user type
  const targetRole = await dataSource.getRepository(Role).findOne({
    where: {
      key:
        req.body.user_type === UserType.company
          ? SystemRoles.company_owner
          : req.body.user_type === UserType.pharmacy
            ? SystemRoles.pharmacy_owner
            : SystemRoles.doctor,
    },
  });
  if (!targetRole) return next(new Errors.NotFound(ErrCodes.ROLE_NOT_FOUND, req.language));

  let user;
  try {
    user = await UserRepo.save({
      id: userId,
      email: req.body.email,
      phone: req.body.phone,
      user_type: req.body.user_type,
      password: hashedPwd,
      verification_code: code,
      role_id: targetRole,
      fcm_token: req.body.fcm_token,
      verification_reason: VerifyReason.signup,
      account_provider_id: { id: userId },
    });
  } catch (error) {
    logger.error(error);
    return next(new Errors.BadRequest(ErrCodes.EMAIL_ALREADY_EXISTS, req.language));
  }

  try {
    const profileData: any = req.body;
    if (req.body.country_id) profileData.country_id = { id: req.body.country_id };
    if (req.body.city_id) profileData.city_id = { id: req.body.city_id };
    if (req.body.state_id) profileData.state_id = { id: req.body.state_id };
    if (req.body.user_type === UserType.doctor) {
      const profile = await UserDoctorProfileRepo.save(profileData);
      await dataSource
        .getRepository(UserAuth)
        .update({ id: userId }, { user_doctor_profile: { id: profile.id } });
    } else if (req.body.user_type === UserType.pharmacy) {
      const profile = await UserPharmacyProfileRepo.save(profileData);
      await dataSource
        .getRepository(UserAuth)
        .update({ id: userId }, { user_pharmacy_profile: { id: profile.id } });
    } else {
      const profile = await UserCompanyProfileRepo.save(profileData);
      await dataSource
        .getRepository(UserAuth)
        .update({ id: userId }, { user_company_profile: { id: profile.id } });
    }
  } catch (error) {
    logger.error(error);
    await UserRepo.delete({ id: userId });
    return next(new Errors.BadRequest(ErrCodes.INVALID_DATA, req.language));
  }
  await dataSource.getRepository(AllowedVisitTime).save({ user_id: { id: userId } });

  // TODO: send code by email

  res.status(201).json({
    success: true,
    message: 'User created successfully & code sent by email',
    data: {},
  });
};
