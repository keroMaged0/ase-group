import { isauthenticated } from './isauthenticated.guard';
import { isauthorized } from './isauthorized.guard';
import { isverified } from './isverified.guard';

export const Guards = {
  isauthorized,
  isauthenticated,
  isverified,
};
