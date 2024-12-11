import { RequestHandler } from 'express';

import { MedicineCategory } from '../../models/medicine_category.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { awsS3 } from '../../config/s3';
import { FOLDERS } from '../../types/folders';

export const updateMedicineCategoryHandler: RequestHandler<
  { medicine_category_id: string },
  SuccessResponse,
  {
    name?: string;
    parent_id?: string;
    cover_image?: string;
  }
> = async (req, res, next) => {
  const { medicine_category_id } = req.params;
  const { name, parent_id } = req.body;
  const userId = req.loggedUser.id;

  if (req.file) {
    const oldImage = await dataSource.getRepository(MedicineCategory).findOne({
      where: { id: medicine_category_id },
      select: ['cover_image'],
    });

    if (oldImage?.cover_image) {
      await awsS3.removeBucketFiles(oldImage.cover_image);
    }

    req.body.cover_image = FOLDERS.medicineCategory + '/' + req.file.filename;
    await awsS3.saveBucketFiles(FOLDERS.medicineCategory, req.file);
  }

  const medicineCategory = await dataSource
    .getRepository(MedicineCategory)
    .createQueryBuilder()
    .update(MedicineCategory)
    .set({ name, parent_id: { id: parent_id } })
    .where('id = :id AND provider_id = :provider_id', {
      id: medicine_category_id,
      provider_id: userId,
      cover_image: req.body.cover_image,
    })
    .execute();
  if (medicineCategory.affected === 0)
    return next(new Errors.NotFound(ErrCodes.MEDICINE_CATEGORY_NOT_FOUND));

  return res.json({
    success: true,
    message: 'Medicine category updated successfully',
    data: {},
  });
};
