import { config } from '@gig/config';
import { winstonLogger } from '@vuphuc47edge/jobber-shared';
import { createClient } from 'redis';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigServiceRedis', 'debug');

type RedisClient = ReturnType<typeof createClient>;

export const client: RedisClient = createClient({ url: `${config.REDIS_HOST}` });

export const redisConnect = async (): Promise<void> => {
  try {
    await client.connect();
    log.info(`GigService Redis Connection: ${await client.ping()}`);
    cacheError();
  } catch (error) {
    log.log('error', 'GigService redisConnect() method error:', error);
  }
};

const cacheError = (): void => {
  client.on('error', (error: unknown) => {
    log.error(error);
  });
};
