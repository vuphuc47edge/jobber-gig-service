/* eslint-disable @typescript-eslint/no-explicit-any */
import { gigCreate } from '@gig/controllers/create';
import { authUserPayload, gigMockRequest, gigMockResponse, sellerGig } from '@gig/controllers/test/mocks/gig.mock';
import { gigCreateSchema } from '@gig/schemes/gig';
import * as gigService from '@gig/services/gig.service';
import * as helper from '@vuphuc47edge/jobber-shared';
import { BadRequestError } from '@vuphuc47edge/jobber-shared';
import { Request, Response } from 'express';

jest.mock('@gig/services/gig.service');
jest.mock('@vuphuc47edge/jobber-shared');
jest.mock('@vuphuc47edge/jobber-shared');
jest.mock('@gig/schemes/gig');
jest.mock('@gig/elasticsearch');
jest.mock('@elastic/elasticsearch');

describe('Gig Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('gig method', () => {
    it('should throw an error for invalid schema data', () => {
      const req: Request = gigMockRequest({}, sellerGig, authUserPayload) as unknown as Request;
      const res: Response = gigMockResponse();
      jest.spyOn(gigCreateSchema, 'validate').mockImplementation((): any =>
        Promise.resolve({
          error: {
            name: 'ValidationError',
            isJoi: true,
            details: [{ message: 'This is an error message' }]
          }
        })
      );

      gigCreate(req, res).catch(() => {
        expect(BadRequestError).toHaveBeenCalledWith('This is an error message', 'Create gig() method');
      });
    });

    it('should throw file upload error', () => {
      const req: Request = gigMockRequest({}, sellerGig, authUserPayload) as unknown as Request;
      const res: Response = gigMockResponse();
      jest.spyOn(gigCreateSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));
      jest.spyOn(helper, 'upload').mockImplementation((): any => Promise.resolve({ public_id: '' }));

      gigCreate(req, res).catch(() => {
        expect(BadRequestError).toHaveBeenCalledWith('File upload error. Try again.', 'Create gig() method');
      });
    });

    it('should create a new gig and return the correct response', async () => {
      const req: Request = gigMockRequest({}, sellerGig, authUserPayload) as unknown as Request;
      const res: Response = gigMockResponse();
      jest.spyOn(gigCreateSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));
      jest.spyOn(helper, 'upload').mockImplementation((): any => Promise.resolve({ public_id: '123456' }));
      jest.spyOn(gigService, 'createGig').mockResolvedValue(sellerGig);

      await gigCreate(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Gig created successfully.',
        gig: sellerGig
      });
    });
  });
});
