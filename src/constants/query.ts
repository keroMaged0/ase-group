import { dataSource } from '../config/typeorm';
import { UserAuth, UserType } from '../models/user-auth.model';

export const selectCreatedByJoinFields = (field: string) => {
  return [`${field}.id`, `${field}.email`, `${field}.job_title`];
};

export const selectUserProfileJoinFields = (joinAlias: string) => {
  if (joinAlias.toLocaleLowerCase().includes('pharmacy'))
    return [`${joinAlias}.name`, `${joinAlias}.profile_image`];
  return [
    `${joinAlias}.first_name`,
    `${joinAlias}.middle_name`,
    `${joinAlias}.last_name`,
    `${joinAlias}.profile_image`,
  ];
};

const selectUserFields = `CASE
WHEN user_auth.user_type = ${UserType.company} THEN json_build_object(
    'id', user_auth.id,
    'email', user_auth.email,
    'first_name', user_company_profile.first_name,
    'last_name', user_company_profile.last_name,
    'profile_image', user_company_profile.profile_image
)
WHEN user_auth.user_type = ${UserType.doctor} THEN json_build_object(
    'id', user_auth.id,
    'email', user_auth.email,
    'first_name', user_doctor_profile.first_name,
    'last_name', user_doctor_profile.last_name,
    'profile_image', user_doctor_profile.profile_image
)
WHEN user_auth.user_type = ${UserType.pharmacy} THEN json_build_object(
    'id', user_auth.id,
    'email', user_auth.email,
    'name', user_pharmacy_profile.name,
    'profile_image', user_pharmacy_profile.profile_image
)
ELSE NULL
END`;

export const userDataSubQuery = (filterField: string) => {
  return dataSource
    .createQueryBuilder()
    .subQuery()
    .select(selectUserFields)
    .from(UserAuth, 'user_auth')
    .leftJoin('user_auth.user_company_profile', 'user_company_profile')
    .leftJoin('user_auth.user_doctor_profile', 'user_doctor_profile')
    .leftJoin('user_auth.user_pharmacy_profile', 'user_pharmacy_profile')
    .where(`${filterField} = user_auth.id`)
    .getQuery();
};
