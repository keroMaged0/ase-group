export type SuccessResponse<T = any> = {
  success: boolean;
  message: string;
  data: T;
};

export type ErrorResponse = {
  success: boolean;
  message: string;
  data: any;
};

export type PaginationResponse<T = any> = {
  success: boolean;
  message: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    resultCount: number;
  };
  data: T;
};

export type ValidationErrorResponse = {
  success: boolean;
  message: string;
  errors: { message: string; field?: string }[];
  data: any;
};
