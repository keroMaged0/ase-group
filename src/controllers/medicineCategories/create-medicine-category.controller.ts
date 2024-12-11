import { RequestHandler } from 'express';

import { MedicineCategory } from '../../models/medicine_category.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { FOLDERS } from '../../types/folders';
import { awsS3 } from '../../config/s3';
import { Errors } from '../../errors';

export const createMedicineCategoryHandler: RequestHandler<
  unknown,
  SuccessResponse,
  { name: string; parent_id?: string; profile_image?: string }
> = async (req, res, next) => {
  const { name, parent_id } = req.body;
  const userId = req.loggedUser;

  if (req.file) {
    req.body.profile_image = FOLDERS.medicineCategory + '/' + req.file.filename;
    await awsS3.saveBucketFiles(FOLDERS.medicineCategory, req.file);
  }

  try {
    const medicineCategory = await dataSource.getRepository(MedicineCategory).save({
      name,
      parent_id: parent_id ? { id: parent_id } : null,
      provider_id: { id: userId.provider_id },
      created_by: { id: userId.id },
      cover_image: req.body.profile_image || '',
    });

    return res.json({
      success: true,
      message: 'Medicine category created successfully',
      data: medicineCategory,
    });
  } catch (error) {
    return next(new Errors.BadRequest(ErrCodes.SAVE_MEDICINE_CATEGORY_FAILED));
  }
};
