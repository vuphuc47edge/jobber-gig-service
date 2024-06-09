import { health } from '@gig/controllers/health';
import express, { Router } from 'express';

const router: Router = express.Router();

export const healthRoutes = (): Router => {
  router.get('/gig-health', health);

  return router;
};
