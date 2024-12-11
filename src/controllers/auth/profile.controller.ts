import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { UserType } from '../../models/user-auth.model';
import { UserProfileCompany } from '../../models/user-profile-company.model';
import { UserProfileDoctor } from '../../models/user-profile-doctor.model';
import { UserProfilePharmacy } from '../../models/user-profile-pharmacy.model';
import { SuccessResponse } from '../../types/responses';
import { FOLDERS } from '../../types/folders';
import { env } from '../../config/env';
import { Repository } from 'typeorm';
import { awsS3 } from '../../config/s3';

// TODO: handle nested_specialty_id
export const updateProfileHandler: RequestHandler<
  unknown,
  SuccessResponse,
  UserProfileCompany | UserProfileDoctor | UserProfilePharmacy
> = async (req, res, next) => {
  const profileImageFile: Express.Multer.File = (req.files as any)?.profile_image?.[0];
  const lisenceImageFile: Express.Multer.File = (req.files as any)?.license_image?.[0];
  const userCompany = dataSource.getRepository(UserProfileCompany);
  const userDoctor = dataSource.getRepository(UserProfileDoctor);
  const userPharmacy = dataSource.getRepository(UserProfilePharmacy);

  if (profileImageFile) {
    req.body.profile_image = FOLDERS.profile + '/' + profileImageFile.filename;
    await awsS3.saveBucketFiles(FOLDERS.profile, profileImageFile);
  }
  if (lisenceImageFile) {
    (req.body as UserProfilePharmacy).license_image =
      FOLDERS.profile + '/' + lisenceImageFile.filename;
    await awsS3.saveBucketFiles(FOLDERS.profile, lisenceImageFile);
  }

  let oldProfileImage: string = '',
    oldLicenseImage: string = '';
  switch (req.loggedUser.user_type) {
    case UserType.company:
      if (req.file) {
        const company = await userCompany.findOne({
          where: { id: req.loggedUser.profile_id },
          select: ['profile_image'],
        });
        oldProfileImage = company?.profile_image || '';
      }
      await userCompany.update({ id: req.loggedUser.profile_id }, req.body as UserProfileCompany);
      break;
    case UserType.doctor:
      if (req.file) {
        const doctor_specialties = (req.body as UserProfileDoctor).nested_specialty_id;
        if (doctor_specialties) (req.body as any).nested_specialty_id! = undefined;
        const doctor = await userDoctor.findOne({
          where: { id: req.loggedUser.profile_id },
          select: ['profile_image'],
        });
        oldProfileImage = doctor?.profile_image || '';
      }
      await userDoctor.update({ id: req.loggedUser.profile_id }, req.body as UserProfileDoctor);
      break;
    case UserType.pharmacy:
      if (req.file) {
        const pharmacy = await userPharmacy.findOne({
          where: { id: req.loggedUser.profile_id },
          select: ['profile_image', 'license_image'],
        });
        oldProfileImage = pharmacy?.profile_image || '';
        oldLicenseImage = pharmacy?.license_image || '';
      }
      await userPharmacy.update({ id: req.loggedUser.profile_id }, req.body as UserProfilePharmacy);
      break;
  }

  if (oldProfileImage) awsS3.removeBucketFiles(oldProfileImage);
  if (oldLicenseImage) awsS3.removeBucketFiles(oldLicenseImage);

  res.status(200).json({ success: true, message: 'profile updated successfully', data: {} });
};

const getProfileQuery = (repository: Repository<any>, profileId: string, userType?: UserType) => {
  const query = repository
    .createQueryBuilder('profile')
    .leftJoinAndSelect('profile.country_id', 'country')
    .leftJoinAndSelect('profile.city_id', 'city')
    .leftJoinAndSelect('profile.state_id', 'state')
    .where('profile.id = :profileId', { profileId })
    .addSelect(
      `CASE WHEN profile.profile_image IS NOT NULL THEN CONCAT('${env.apiUrl}/api/v1/attachments?filePath=', profile.profile_image) ELSE NULL END`,
      'profile_profile_image',
    );
  if (userType === UserType.pharmacy)
    query.addSelect(
      `CASE WHEN profile.license_image IS NOT NULL THEN CONCAT('${env.apiUrl}/api/v1/attachments?filePath=', profile.license_image) ELSE NULL END`,
      'profile_license_image',
    );
  return query.getOne();
};

export const getProfileHandler: RequestHandler = async (req, res, next) => {
  const userCompany = dataSource.getRepository(UserProfileCompany);
  const userDoctor = dataSource.getRepository(UserProfileDoctor);
  const userPharmacy = dataSource.getRepository(UserProfilePharmacy);
  let profile;
  switch (req.loggedUser.user_type) {
    case UserType.company:
      profile = await getProfileQuery(userCompany, req.loggedUser.profile_id);
      break;
    case UserType.doctor:
      profile = await getProfileQuery(userDoctor, req.loggedUser.profile_id);
      break;
    case UserType.pharmacy:
      profile = await getProfileQuery(userPharmacy, req.loggedUser.profile_id, UserType.pharmacy);
      break;
  }
  res.status(200).json({ success: true, message: 'profile fetched successfully', data: profile });
};
