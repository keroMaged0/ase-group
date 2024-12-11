/* eslint-disable @typescript-eslint/no-namespace */

import { IjwtPayload } from './jwt-payload';
import { Ipagination } from './Pagination';

declare global {
  namespace Express {
    interface Request {
      loggedUser: IjwtPayload;
      pagination: Ipagination;
      language: 'en' | 'ar';
    }
  }
}
