import { Router } from 'express';

import * as doctorSpecialtiesValidator from '../validators/doctor-specialties.validator';
import * as doctorSpecialtiesController from '../controllers/doctorSpecialties/index';
import { Guards } from '../guards';
import { PERMISSIONS } from '../types/permissions';

const router = Router();

router
  .route('/')
  .post(
    Guards.isauthenticated,
    Guards.isauthorized(PERMISSIONS.create_doctor_specialty),
    doctorSpecialtiesValidator.createDoctorSpecialtyValidator,
    doctorSpecialtiesController.createDoctorSpecialtyHandler,
  )
  .get(doctorSpecialtiesController.getAllDoctorsSpecialtiesHandler);

router
  .route('/:specialty_id')
  .get(
    doctorSpecialtiesValidator.doctorSpecialtiesParamValidator,
    doctorSpecialtiesController.getDoctorSpecialtyByIdHandler,
  )
  .put(
    Guards.isauthenticated,
    Guards.isauthorized(PERMISSIONS.update_doctor_specialty),
    doctorSpecialtiesValidator.updateDoctorSpecialtiesValidator,
    doctorSpecialtiesController.updateDoctorSpecialtyHandler,
  )
  .delete(
    Guards.isauthenticated,
    Guards.isauthorized(PERMISSIONS.remove_doctor_specialty),
    doctorSpecialtiesValidator.doctorSpecialtiesParamValidator,
    doctorSpecialtiesController.deleteDoctorSpecialtyHandler,
  );

export const doctorSpecialtiesRoutes = router;
