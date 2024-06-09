import { Client } from '@elastic/elasticsearch';
import { ClusterHealthHealthResponseBody, CountResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@gig/config';
import { ISellerGig, winstonLogger } from '@vuphuc47edge/jobber-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'GigServiceElasticSearch', 'debug');

export const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

export const checkConnection = async (): Promise<void> => {
  let isConnected = false;

  while (!isConnected) {
    try {
      const health: ClusterHealthHealthResponseBody = await elasticSearchClient.cluster.health({});
      log.info(`GigService ElasticSearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.log('GigService checkConnection() method error:', error);
    }
  }
};

const checkIfIndexExist = async (indexName: string): Promise<boolean> => {
  const result: boolean = await elasticSearchClient.indices.exists({ index: indexName });
  return result;
};

export const createIndex = async (indexName: string): Promise<void> => {
  try {
    const result: boolean = await checkIfIndexExist(indexName);

    if (result) {
      log.info(`Index "${indexName}" already exist.`);
    } else {
      await elasticSearchClient.indices.create({ index: indexName });
      await elasticSearchClient.indices.refresh({ index: indexName });
      log.info(`Created index ${indexName}`);
    }
  } catch (error) {
    log.error(`An error occurred while creating the index ${indexName}`);
    log.log('error', 'GigService createIndex() method error:', error);
  }
};

export const getDocumentCount = async (index: string): Promise<number> => {
  try {
    const result: CountResponse = await elasticSearchClient.count({ index });

    return result.count;
  } catch (error) {
    log.log('error', 'GigService elasticsearch getDocumentCount() method error:', error);
    return 0;
  }
};

export const getIndexedData = async (index: string, itemId: string): Promise<ISellerGig> => {
  try {
    const result: GetResponse = await elasticSearchClient.get({ index, id: itemId });

    return result._source as ISellerGig;
  } catch (error) {
    log.log('error', 'GigService elasticsearch getIndexedData() method error:', error);
    return {} as ISellerGig;
  }
};

export const addDataToIndex = async (index: string, itemId: string, gigDocument: unknown): Promise<void> => {
  try {
    await elasticSearchClient.index({
      index,
      id: itemId,
      document: gigDocument
    });
  } catch (error) {
    log.log('error', 'GigService elasticsearch addDataToIndex() method error:', error);
  }
};

export const updateIndexedData = async (index: string, itemId: string, gigDocument: unknown): Promise<void> => {
  try {
    await elasticSearchClient.update({
      index,
      id: itemId,
      doc: gigDocument
    });
  } catch (error) {
    log.log('error', 'GigService elasticsearch updateIndexedData() method error:', error);
  }
};

export const deleteIndexedData = async (index: string, itemId: string): Promise<void> => {
  try {
    await elasticSearchClient.delete({
      index,
      id: itemId
    });
  } catch (error) {
    log.log('error', 'GigService elasticsearch deleteIndexedData() method error:', error);
  }
};
