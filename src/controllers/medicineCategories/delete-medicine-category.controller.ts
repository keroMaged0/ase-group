import { RequestHandler } from 'express';

import { MedicineCategory } from '../../models/medicine_category.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';

export const deleteMedicineCategoryHandler: RequestHandler<
  { medicine_category_id: string },
  SuccessResponse
> = async (req, res, next) => {
  const { medicine_category_id } = req.params;

  const medicationCategory = await dataSource
    .createQueryBuilder()
    .update(MedicineCategory)
    .set({ is_deleted: true })
    .where('(id = :id AND is_deleted = false) OR (parent_id = :id AND is_deleted = false)', {
      id: medicine_category_id,
      parent_id: medicine_category_id,
    })
    .returning('cover_image')
    .execute();
  if (medicationCategory.affected === 0)
    return next(new Errors.NotFound(ErrCodes.MEDICINE_CATEGORY_NOT_FOUND));

  return res.json({
    success: true,
    message: 'Medicine category deleted successfully',
    data: {},
  });
};
