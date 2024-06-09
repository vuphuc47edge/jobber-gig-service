import { config } from '@gig/config';
import { checkConnection, createIndex } from '@gig/elasticsearch';
import { createConnection } from '@gig/queues/connection';
import { consumeGigDirectMessage, consumeSeedDirectMessages } from '@gig/queues/gig.comsumer';
import { appRoutes } from '@gig/routes';
import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@vuphuc47edge/jobber-shared';
import { Channel } from 'amqplib';
import compression from 'compression';
import cors from 'cors';
import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import { verify } from 'jsonwebtoken';
import { Logger } from 'winston';

const SERVER_PORT = 4004;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'GigServer', 'debug');

export let gigChannel: Channel;

export const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueue();
  startElasticSearch();
  gigErrorHandler(app);
  startServer(app);
};

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token: string = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = verify(token, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    }

    next();
  });
};

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
};

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
};

const startQueue = async (): Promise<void> => {
  gigChannel = (await createConnection()) as Channel;
  await consumeGigDirectMessage(gigChannel);
  await consumeSeedDirectMessages(gigChannel);
};

const startElasticSearch = (): void => {
  checkConnection();
  createIndex('gigs');
};

const gigErrorHandler = (app: Application): void => {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `GigService ${error.comingFrom}`, error);

    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }

    next();
  });
};

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`GigService has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`GigService running on port ${SERVER_PORT}...`);
    });
  } catch (error) {
    log.log('error', 'GigService startServer() method error:', error);
  }
};
