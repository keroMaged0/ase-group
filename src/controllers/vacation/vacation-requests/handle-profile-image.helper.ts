import { env } from '../../../config/env';
import { VacationRequestStatus, VacationRequestType } from '../../../models/vacation-request.model';

export const handleProfileImage = (result: any[], fields: string[]) => {
  result.forEach((vacationRequest: any) => {
    for (const field of fields) {
      if (vacationRequest[field].user_company_profile === null)
        vacationRequest[field].user_company_profile = undefined;
      if (vacationRequest[field].user_pharmacy_profile === null)
        vacationRequest[field].user_pharmacy_profile = undefined;
      if (vacationRequest[field].user_doctor_profile === null)
        vacationRequest[field].user_doctor_profile = undefined;
      if (vacationRequest[field].user_company_profile?.profile_image != undefined)
        vacationRequest[field].user_company_profile.profile_image =
          `${env.apiUrl}/api/v1/attachments?filePath=${vacationRequest[field].user_company_profile.profile_image}`;
      if (vacationRequest[field].user_pharmacy_profile?.profile_image != undefined)
        vacationRequest[field].user_pharmacy_profile.profile_image =
          `${env.apiUrl}/api/v1/attachments?filePath=${vacationRequest[field].user_pharmacy_profile.profile_image}`;
      if (vacationRequest[field].user_doctor_profile?.profile_image != undefined)
        vacationRequest[field].user_doctor_profile.profile_image =
          `${env.apiUrl}/api/v1/attachments?filePath=${vacationRequest[field].user_doctor_profile.profile_image}`;
    }
    vacationRequest.status = VacationRequestStatus[vacationRequest.status];
    vacationRequest.request_type = VacationRequestType[vacationRequest.request_type];
  });
};
