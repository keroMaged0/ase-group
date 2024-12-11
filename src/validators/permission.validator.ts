import { body, param } from 'express-validator';

import { validator } from '../middlewares/validator.middleware';

export const update = [param('permission_id').isUUID(), body('description').isString(), validator];
