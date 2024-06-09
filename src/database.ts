import { config } from '@gig/config';
import { winstonLogger } from '@vuphuc47edge/jobber-shared';
import mongoose from 'mongoose';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'GigServiceDatabase', 'debug');

export const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    log.info('GigService success connected to database');
  } catch (error) {
    log.log('error', 'GigService databaseConnection() method error:', error);
  }
};
