export enum ERR_CODES {
  notFound = 'NOT_FOUND',
  badRequest = 'BAD_REQUEST',
  databaseConnection = 'DATABASE_CONNECTION',
  notAllowed = 'NOT_ALLOWED',
  unauthorized = 'UNAUTHORIZED',
  validationError = 'VALIDATION_ERROR',
  verifyYourAccount = 'VERIFY_YOUR_ACCOUNT',
  routeNotFound = 'ROUTE_NOT_FOUND',
  fileNotFoundOnBucket = 'FILE_NOT_FOUND_ON_BUCKET',
  invalidFileFormat = 'INVALID_FILE_FORMAT',
  ROLE_ALREADY_EXISTS = 'ROLE_ALREADY_EXISTS',
  ROLE_IS_ASSOCIATED_TO_OTHER_USERS = 'ROLE_IS_ASSOCIATED_TO_OTHER_USERS',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  COUNTRY_NOT_FOUND = 'COUNTRY_NOT_FOUND',
  CITY_NOT_FOUND = 'CITY_NOT_FOUND',
  STATE_NOT_FOUND = 'STATE_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDINTIALS = 'INVALID_CREDINTIALS',
  USER_NOT_VERIFIED = 'USER_NOT_VERIFIED',
  USER_NOT_VERIFIED_BY_CRM = 'USER_NOT_VERIFIED_BY_CRM',
  INVALID_DATA = 'INVALID_DATA',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  VERIFICATION_CODE_NOT_VERIFIED = 'VERIFICATION_CODE_NOT_VERIFIED',
  INVALID_VERIFICATION_CODE = 'INVALID_VERIFICATION_CODE',
  NO_REASON_TO_VERIFY = 'NO_REASON_TO_VERIFY',
  INVALID_CODE = 'INVALID_CODE',
  EXPIRED_CODE = 'EXPIRED_CODE',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_REASON_TO_RESEND_CODE = 'NO_REASON_TO_RESEND_CODE',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  ALLOWED_VISIT_TIME_NOT_FOUND = 'ALLOWED_VISIT_TIME_NOT_FOUND',
  PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',
  PARENT_SPECIALTY_NOT_FOUND = 'PARENT_SPECIALTY_NOT_FOUND',
  SPECIALTY_ALREADY_EXISTS = 'SPECIALTY_ALREADY_EXISTS',
  SPECIALTY_NOT_FOUND = 'SPECIALTY_NOT_FOUND',
  SPECIALTY_HAS_CHILDREN = 'SPECIALTY_HAS_CHILDREN',
  SAVE_TARGET_FAILED = 'SAVE_TARGET_FAILED',
  TARGET_NOT_FOUND = 'TARGET_NOT_FOUND',
  SAVE_POINT_FAILED = 'SAVE_POINT_FAILED',
  POINT_NOT_FOUND = 'POINT_NOT_FOUND',
  EXCEED_TOTAL_ALLOWED_DAYS = 'EXCEED_TOTAL_ALLOWED_DAYS',
  STATUS_IS_ALREADY_UPDATED = 'STATUS_IS_ALREADY_UPDATED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  MEDICINE_CATEGORY_HAS_CHILDREN = 'MEDICINE_CATEGORY_HAS_CHILDREN',
  SAVE_MEDICINE_CATEGORY_FAILED = 'SAVE_MEDICINE_CATEGORY_FAILED',
  MEDICINE_CATEGORY_NOT_FOUND = 'MEDICINE_CATEGORY_NOT_FOUND',
  SAVE_PRODUCT_FAILED = 'SAVE_PRODUCT_FAILED',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  SAVE_GIFT_FAILED = 'SAVE_GIFT_FAILED',
  WITHDRAW_AMOUNT_REQUIRED = 'WITHDRAW_AMOUNT_REQUIRED',
  POINT_REQUEST_NOT_FOUND = 'POINT_REQUEST_NOT_FOUND',
  INSUFFICIENT_POINTS = 'INSUFFICIENT_POINTS',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
}

export const ErrCodes: { [key in ERR_CODES]: { en: string; ar: string } } = {
  INVALID_DATE_FORMAT: {
    en: 'Invalid Date Format',
    ar: 'تنسيق التاريخ غير صالح',
  },
  INVALID_TOKEN: {
    en: 'Invalid Token',
    ar: 'رمز غير صالح',
  },
  STATUS_IS_ALREADY_UPDATED: {
    en: 'Status is already updated',
    ar: 'الحالة تم تحديثها بالفعل',
  },
  EXCEED_TOTAL_ALLOWED_DAYS: {
    en: 'Exceed Total Allowed Days',
    ar: 'تجاوز إجمالي الأيام المسموح بها',
  },
  ALLOWED_VISIT_TIME_NOT_FOUND: {
    en: 'Allowed Visit Time Not Found',
    ar: 'وقت الزيارة المسموح به غير موجود',
  },
  UNAUTHENTICATED: {
    en: 'Unauthenticated',
    ar: 'غير مصرح',
  },
  NO_REASON_TO_RESEND_CODE: {
    en: 'No Reason To Resend Code',
    ar: 'لا يوجد سبب لإعادة إرسال الرمز',
  },
  USER_NOT_FOUND: {
    en: 'User Not Found',
    ar: 'المستخدم غير موجود',
  },
  EXPIRED_CODE: {
    en: 'Expired Code',
    ar: 'الرمز منتهي الصلاحية',
  },
  INVALID_CODE: {
    en: 'Invalid Code',
    ar: 'رمز غير صالح',
  },
  NO_REASON_TO_VERIFY: {
    en: 'No Reason To Verify',
    ar: 'لا يوجد سبب للتحقق',
  },
  INVALID_VERIFICATION_CODE: {
    en: 'Invalid Verification Code',
    ar: 'رمز التحقق غير صالح',
  },
  VERIFICATION_CODE_NOT_VERIFIED: {
    en: 'Verification Code Not Verified',
    ar: 'لم يتم التحقق من رمز التحقق',
  },
  EMAIL_NOT_FOUND: {
    en: 'Email Not Found',
    ar: 'البريد الإلكتروني غير موجود',
  },
  INVALID_DATA: {
    en: 'Invalid Data',
    ar: 'بيانات غير صالحة',
  },
  USER_NOT_VERIFIED_BY_CRM: {
    en: 'User Not Verified By CRM',
    ar: 'المستخدم غير موثق من قبل CRM',
  },
  USER_NOT_VERIFIED: {
    en: 'User Not Verified',
    ar: 'المستخدم غير موثق',
  },
  INVALID_CREDINTIALS: {
    en: 'Invalid Credintials',
    ar: 'بيانات الاعتماد غير صالحة',
  },
  EMAIL_ALREADY_EXISTS: {
    en: 'Email Already Exists',
    ar: 'البريد الإلكتروني موجود بالفعل',
  },
  STATE_NOT_FOUND: {
    en: 'State Not Found',
    ar: 'الولاية غير موجودة',
  },
  CITY_NOT_FOUND: {
    en: 'City Not Found',
    ar: 'المدينة غير موجودة',
  },
  COUNTRY_NOT_FOUND: {
    en: 'Country Not Found',
    ar: 'الدولة غير موجودة',
  },
  ROLE_NOT_FOUND: {
    en: 'Role Not Found',
    ar: 'الدور غير موجود',
  },
  ROLE_IS_ASSOCIATED_TO_OTHER_USERS: {
    en: 'Role is associated with users',
    ar: 'الدور مرتبط بمستخدمين',
  },
  ROLE_ALREADY_EXISTS: {
    en: 'Role is Already Exists',
    ar: 'الدور موجود بالفعل',
  },
  INVALID_FILE_FORMAT: {
    en: 'Invalid File Format',
    ar: 'تنسيق الملف غير صالح',
  },
  FILE_NOT_FOUND_ON_BUCKET: {
    en: 'File Not Found On Bucket',
    ar: 'الملف غير موجود على السلة',
  },
  ROUTE_NOT_FOUND: {
    en: 'Route Not Found',
    ar: 'المسار غير موجود',
  },
  VERIFY_YOUR_ACCOUNT: {
    en: 'Verify Your Account',
    ar: 'قم بتأكيد حسابك',
  },
  NOT_FOUND: {
    en: 'Not Found',
    ar: 'غير موجود',
  },
  BAD_REQUEST: {
    en: 'Bad Request',
    ar: 'طلب خاطئ',
  },
  DATABASE_CONNECTION: {
    en: 'Database Connection Error',
    ar: 'خطأ في الاتصال بقاعدة البيانات',
  },
  NOT_ALLOWED: {
    en: 'Not Allowed',
    ar: 'غير مسموح',
  },
  UNAUTHORIZED: {
    en: 'Unauthorized',
    ar: 'غير مصرح',
  },
  VALIDATION_ERROR: {
    en: 'Validation Error',
    ar: 'خطأ في التحقق',
  },
  PERMISSION_NOT_FOUND: {
    en: 'Permission Not Found',
    ar: 'الصلاحية غير موجودة',
  },
  PARENT_SPECIALTY_NOT_FOUND: {
    en: 'Parent Specialty Not Found',
    ar: 'التخصص الرئيسي غير موجود',
  },
  SPECIALTY_ALREADY_EXISTS: {
    en: 'Specialty Already Exists',
    ar: 'التخصص موجود بالفعل',
  },
  SPECIALTY_NOT_FOUND: {
    en: 'Specialty Not Found',
    ar: 'التخصص غير موجود',
  },
  SPECIALTY_HAS_CHILDREN: {
    en: 'Specialty Has Children',
    ar: 'التخصص لديه أطفال',
  },
  SAVE_TARGET_FAILED: {
    en: 'Save Target Failed',
    ar: 'فشل حفظ الهدف',
  },
  TARGET_NOT_FOUND: {
    en: 'Target Not Found',
    ar: 'الهدف غير موجود',
  },
  POINT_NOT_FOUND: {
    en: 'Point Not Found',
    ar: 'النقطة غير موجودة',
  },
  SAVE_POINT_FAILED: {
    en: 'Save Point Failed',
    ar: 'فشل حفظ النقطة',
  },
  MEDICINE_CATEGORY_HAS_CHILDREN: {
    en: 'Medicine Category Has Children',
    ar: 'فئة الدواء لديها أطفال',
  },
  SAVE_MEDICINE_CATEGORY_FAILED: {
    en: 'Save Medicine Category Failed',
    ar: 'فشل حفظ فئة الدواء',
  },
  MEDICINE_CATEGORY_NOT_FOUND: {
    en: 'Medicine Category Not Found',
    ar: 'فئة الدواء غير موجودة',
  },
  SAVE_PRODUCT_FAILED: {
    en: 'Save Product Failed',
    ar: 'فشل حفظ المنتج',
  },
  PRODUCT_NOT_FOUND: {
    en: 'Product Not Found',
    ar: 'المنتج غير موجود',
  },
  SAVE_GIFT_FAILED: {
    en: 'Save Gift Failed',
    ar: 'فشل حفظ الهدية',
  },
  WITHDRAW_AMOUNT_REQUIRED: {
    en: 'Withdraw Amount Required',
    ar: 'مطلوب مبلغ السحب',
  },
  POINT_REQUEST_NOT_FOUND: {
    en: 'Point Request Not Found',
    ar: 'طلب النقاط غير موجود',
  },
  INSUFFICIENT_POINTS: {
    en: 'Insufficient Points',
    ar: 'النقاط غير كافية',
  },
};
