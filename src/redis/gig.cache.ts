import { config } from '@gig/config';
import { client } from '@gig/redis/redis.connection';
import { winstonLogger } from '@vuphuc47edge/jobber-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigServiceCache', 'debug');

export const getUserSelectedGigCategory = async (key: string): Promise<string> => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const response: string = (await client.GET(key)) as string;

    return response;
  } catch (error) {
    log.log('error', 'GigService getUserSelectedGigCategory() method error:', error);
    return '';
  }
};
