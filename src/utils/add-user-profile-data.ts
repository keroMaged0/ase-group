import { SelectQueryBuilder } from 'typeorm';

import { UserType } from '../models/user-auth.model';

export const addUserProfileData = ({
  queryBuilder,
  userAlias,
  profileAlias,
}: {
  queryBuilder: SelectQueryBuilder<any>;
  userAlias: string;
  profileAlias: string;
}) => {
  return queryBuilder
    .leftJoin(`user_profile_company`, `${profileAlias}_company`, `${profileAlias}_company.user_auth_id = ${userAlias}.id`)
    .leftJoin(`user_profile_doctor`, `${profileAlias}_doctor`, `${profileAlias}_doctor.user_auth_id = ${userAlias}.id`)
    .leftJoin(`user_profile_pharmacy`, `${profileAlias}_pharmacy`, `${profileAlias}_pharmacy.user_auth_id = ${userAlias}.id`)
    .addSelect(`
      CASE
        WHEN ${userAlias}.user_type = ${UserType.company} THEN json_build_object(
          'id', ${userAlias}.id,
          'first_name', ${profileAlias}_company.first_name,
          'last_name', ${profileAlias}_company.last_name,
          'profile_image', ${profileAlias}_company.profile_image
        )
        WHEN ${userAlias}.user_type = ${UserType.doctor} THEN json_build_object(
          'id', ${userAlias}.id,
          'first_name', ${profileAlias}_doctor.first_name,
          'last_name', ${profileAlias}_doctor.last_name,
          'profile_image', ${profileAlias}_doctor.profile_image
        )
        WHEN ${userAlias}.user_type = ${UserType.pharmacy} THEN json_build_object(
          'id', ${userAlias}.id,
          'first_name', ${profileAlias}_pharmacy.name,
          'profile_image', ${profileAlias}_pharmacy.profile_image
        )
        ELSE NULL
      END
    `, `${profileAlias}`);
};
