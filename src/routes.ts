import { gigRoutes } from '@gig/routes/gig';
import { healthRoutes } from '@gig/routes/health';
import { verifyGatewayRequest } from '@vuphuc47edge/jobber-shared';
import { Application } from 'express';

const BASE_PATH = '/api/v1/gig';

export const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, gigRoutes());
};
