import { RequestHandler } from 'express';
import { awsS3 } from '../config/s3';

export const awsGetFiles: RequestHandler = async (req, res, next) => {
  const filePath = req.query.filePath as string;
  res.setHeader('Content-Disposition', `attachment; filename="${filePath}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  awsS3;
};
