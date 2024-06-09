import { config } from '@gig/config';
import { databaseConnection } from '@gig/database';
import { redisConnect } from '@gig/redis/redis.connection';
import { start } from '@gig/server';
import express, { Express } from 'express';

const initialize = (): void => {
  databaseConnection();
  config.cloudinaryConfig();

  const app: Express = express();
  start(app);

  redisConnect();
};

initialize();
