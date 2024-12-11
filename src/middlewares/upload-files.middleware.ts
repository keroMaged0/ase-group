import multer from 'multer';

import { BadRequest } from '../errors/bad-request-error';
import { ErrCodes } from '../types/error-code';
import { v4 } from 'uuid';

export interface uploadOptions {
  fileType?: string[];
  maxSize?: number;
  fileFilter?(req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void;
}

export const uploadMemoryStorage = (options?: uploadOptions) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: options?.maxSize || 3000 * 1024 * 1024 }, // 3MB
    fileFilter: options?.fileFilter
      ? options.fileFilter
      : (async function fileFilter(req, file, callback) {
          try {
            file.filename = `${v4()}.${file.originalname.split('.').at(-1)}`;
            const allowedTypes = options?.fileType || ['image'];
            const isAllowedType = allowedTypes.some((allowedType) =>
              file.mimetype.startsWith(allowedType),
            );
            if (!isAllowedType) return callback(new BadRequest(ErrCodes.INVALID_FILE_FORMAT));
            callback(null, true);
          } catch (error) {
            console.log(error);
            return callback(new BadRequest(ErrCodes.INVALID_FILE_FORMAT));
          }
        } as any),
  });
