import { body, oneOf, param, query, ValidationChain, validationResult } from 'express-validator';
import { Middlewares } from '../middlewares';
import { RequestHandler } from 'express';
import { UserType } from '../models/user-auth.model';

const signupCompany = [
  body('email').isEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  }),
  body('user_type')
    .equals('company')
    .bail()
    .customSanitizer((el) => UserType.company),
  body('first_name').optional().isString(),
  body('middle_name').optional().isString(),
  body('last_name').optional().isString(),
  body('country_id').optional().isUUID('4'),
  body('city_id').optional().isUUID('4'),
  body('state_id').optional().isUUID('4'),
  body('gender')
    .isIn(['male', 'female'])
    .customSanitizer((val) => val === 'male'),
  body('birth_date').optional().isISO8601().bail().toDate(),
  body('fcm_token').optional().isString(),
];

const signupDoctor = [
  body('email').isEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  }),
  body('user_type')
    .equals('doctor')
    .bail()
    .customSanitizer((el) => UserType.doctor),
  body('first_name').optional().isString(),
  body('middle_name').optional().isString(),
  body('last_name').optional().isString(),
  body('nickname').optional().isString(),
  body('country_id').optional().isUUID('4'),
  body('city_id').optional().isUUID('4'),
  body('state_id').optional().isUUID('4'),
  body('gender')
    .isIn(['male', 'female'])
    .customSanitizer((val) => val === 'male'),
  body('birth_date').optional().isISO8601().bail().toDate(),
  body('fcm_token').optional().isString(),
];

const signupPharmacy = [
  body('email').isEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  }),
  body('user_type')
    .equals('pharmacy')
    .bail()
    .customSanitizer((el) => UserType.pharmacy),
  body('name').optional().isString(),
  body('owner_name').isString(),
  body('owner_phone_number').isMobilePhone('any'),
  body('pharmacy_number').optional().isMobilePhone('any'),
  body('country_id').optional().isUUID('4'),
  body('city_id').optional().isUUID('4'),
  body('state_id').optional().isUUID('4'),
  body('birth_date').optional().isISO8601().bail().toDate(),
  body('fcm_token').optional().isString(),
];

export const signin = [body('email').isEmail(), body('password').isString(), Middlewares.validator];

export const signup: RequestHandler = async (req, res, next) => {
  const userType = req.body.user_type;

  let validations: ValidationChain[] = [];

  if (userType === 'company') validations = signupCompany;
  else if (userType === 'doctor') validations = signupDoctor;
  else validations = signupPharmacy;

  await Promise.all(validations.map((validation) => validation.run(req)));
  Middlewares.validator(req, res, next);
};

export const changePassword = [
  body('old_password').isString(),
  body('new_password').isString().bail().isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  Middlewares.validator,
];

export const askForgetPassword = [body('email').isEmail(), Middlewares.validator];

export const updateForgettenPassword = [
  body('email').isEmail(),
  body('new_password')
    .isString()
    .withMessage('Invalid password')
    .bail()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage('Weak password'),
  Middlewares.validator,
];

export const verifyValidator = [
  body('code').isString(),
  body('email').isString(),
  Middlewares.validator,
];

export const updateEmailValidator = [
  body('email').isString(),
  body('password').isString(),
  Middlewares.validator,
];

export const resendVerificationCode = [body('email').isString(), Middlewares.validator];

export const updateCompanyProfile = [
  body('first_name').optional().isString(),
  body('middle_name').optional().isString(),
  body('last_name').optional().isString(),
  body('country_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('city_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('state_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .customSanitizer((val) => val === 'male'),
  body('birth_date').optional().isISO8601().bail().toDate(),
  body('passport').optional().isString(),
  body('address').optional().isString(),
  body('coordinates').optional().isArray({ min: 2, max: 2 }).bail().isNumeric(),
  body('coordinates.1').optional().isFloat({ min: -90, max: 90 }),
  body('coordinates.0').optional().isFloat({ min: -180, max: 180 }),
  body('degree').optional().isString(),
];

export const updateDoctorProfile = [
  body('first_name').optional().isString(),
  body('middle_name').optional().isString(),
  body('last_name').optional().isString(),
  body('nickname').optional().isString(),
  body('country_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('city_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('state_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('address').optional().isString(),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .customSanitizer((val) => val === 'male'),
  body('birth_date').optional().isISO8601().bail().toDate(),
  body('passport').optional().isString(),
  body('coordinates').optional().isArray({ min: 2, max: 2 }).bail().isNumeric(),
  body('coordinates.1').optional().isFloat({ min: -90, max: 90 }),
  body('coordinates.0').optional().isFloat({ min: -180, max: 180 }),
  body('degree').optional().isString(),
  body('main_specialty_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('nested_specialty_id').optional().isArray(),
  body('nested_specialty_id.*')
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
];

export const updatePharmacyProfile = [
  body('name').optional().isString(),
  body('country_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('city_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('state_id')
    .optional()
    .isUUID('4')
    .bail()
    .customSanitizer((el) => ({ id: el })),
  body('address').optional().isString(),
  body('coordinates').optional().isArray({ min: 2, max: 2 }).bail().isNumeric(),
  body('coordinates.1').optional().isFloat({ min: -90, max: 90 }),
  body('coordinates.0').optional().isFloat({ min: -180, max: 180 }),
  body('owner_name').optional().isString(),
  body('owner_phone_number').optional().isMobilePhone('any'),
  body('pharmacy_number').optional().isMobilePhone('any'),
  body('license_number').optional().isString(),
  body('license_holder_name').optional().isString(),
  body('license_holder_number').optional().isString(),
  body('nearest_point').optional().isString(),
];

export const profile: RequestHandler = async (req, res, next) => {
  const userType = req.loggedUser.user_type;

  let validations: ValidationChain[] = [];

  if (userType === UserType.company) validations = updateCompanyProfile;
  else if (userType === UserType.doctor) validations = updateDoctorProfile;
  else validations = updatePharmacyProfile;

  await Promise.all(validations.map((validation) => validation.run(req)));
  Middlewares.validator(req, res, next);
};

export const findUsers = [
  query('id').optional().isUUID('4'),
  query('email').optional().isEmail(),
  query('phone').optional().isMobilePhone('any'),
  query('job_title').optional().isString(),
  query('user_type')
    .optional()
    .isIn(['company', 'doctor', 'pharmacy'])
    .customSanitizer((el) => UserType[el]),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  Middlewares.validator,
];

export const userParam = [param('user_id').isUUID('4'), Middlewares.validator];
