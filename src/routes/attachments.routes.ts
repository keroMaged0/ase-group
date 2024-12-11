import { Router } from 'express';
import { awsS3 } from '../config/s3';

const router = Router();

router.get('/', awsS3.getFiles());

export const attachmentsRoutes: Router = router;
