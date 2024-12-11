import { createTargetHandler } from './create-target.controller';
import { deleteTargetHandler } from './delete-target.controller';
import { getAllTargetsHandler, getPagination } from './get-all-targets.controller';
import { getTargetByIdHandler } from './get-one-target.controller';
import { updateTargetHandler } from './update-target.controller';

export {
  getAllTargetsHandler,
  createTargetHandler,
  getTargetByIdHandler,
  updateTargetHandler,
  deleteTargetHandler,
  getPagination
};
