import aws from 'aws-sdk';
import { env } from './env';
import { logger } from './winston';
import { RequestHandler } from 'express';
import { BadRequest } from '../errors/bad-request-error';
import { ErrCodes } from '../types/error-code';
import { NotFound } from '../errors/notfound-error';

class AWSs3Bucket {
  private s3: aws.S3;
  private bucketName: string;
  constructor() {
    this.s3 = new aws.S3({
      accessKeyId: env.aws.accessKey,
      secretAccessKey: env.aws.secretKey,
      region: env.aws.region,
    });
    this.bucketName = env.aws.bucket;
  }

  async saveBucketFiles(folder: string, ...files: Express.Multer.File[]) {
    for (const file of files) {
      try {
        await this.s3
          .upload({
            Bucket: this.bucketName,
            Key: `${folder}/${file.filename}`,
            Body: file.buffer,
          })
          .promise();
      } catch (error) {
        logger.error(error);
      }
    }
  }

  async removeBucketFiles(...filePaths: string[]) {
    await new Promise((resolve, reject) => {
      this.s3.deleteObjects(
        { Bucket: this.bucketName, Delete: { Objects: filePaths.map((el) => ({ Key: el })) } },
        (err, data) => {
          if (err) {
            logger.error(err);
            reject(err);
          } else resolve(data);
        },
      );
    });
  }

  getFiles(): RequestHandler {
    return async (req, res, next) => {
      const filePath = req.query.filePath as string;
      const params = {
        Bucket: this.bucketName,
        Key: filePath,
      };
      res.setHeader('Content-Disposition', `inline; filename="${filePath}"`);
      this.s3
        .getObject(params)
        .createReadStream()
        .on('error', (err) => {
          logger.error(err);
          return next(new NotFound());
        })
        .on('end', () => {
          res.end();
        })
        .pipe(res);
    };
  }
}

export const awsS3 = new AWSs3Bucket();
