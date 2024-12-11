import { body, param, query } from 'express-validator';
import { validator } from '../middlewares/validator.middleware';


export const give = [
    body('punishment').isUUID('4'),
    body('target_user').isUUID('4'),
    validator,
  ];
  
  export const punishmentRequestParam = [param('punishmentRequestId').isUUID('4'), validator];

  export const get = [
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('created_at_from').optional().isISO8601().toDate(),
    query('created_at_to').optional().isISO8601().toDate(),
    query('created_by').optional().isUUID('4'),
    query('target_user').optional().isUUID('4'),
    query('punishment').optional().isUUID('4'),
    validator,
  ];
  