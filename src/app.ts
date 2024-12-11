import 'express-async-errors';
import './types/custom-definition';

import cors from 'cors';
import express from 'express';

import { checkEnvVariables, env } from './config/env';
import { Middlewares } from './middlewares';
import { apiRoutes } from './routes';
import { homeRoutes } from './routes/home.routes';

export const app = express();

checkEnvVariables();
app.use(express.json({ limit: '5mb' }));
app.use(cors({ origin: env.frontUrl }));
app.use('/', homeRoutes);
app.use(Middlewares.language);
app.use(Middlewares.authentication);
app.use('/api/v1', apiRoutes);
app.use('*', Middlewares.routeNotFound);
app.use(Middlewares.errorHandler);
