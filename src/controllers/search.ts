import { gigsSearch } from '@gig/services/search.service';
import { IPaginateProps, ISearchResult, ISellerGig } from '@vuphuc47edge/jobber-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sortBy } from 'lodash';

export const gigs = async (req: Request, res: Response): Promise<void> => {
  const { from, size, type } = req.params;
  let resultsHits: ISellerGig[] = [];
  const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };
  const gigs: ISearchResult = await gigsSearch(
    `${req.query.query}`,
    paginate,
    `${req.query.delivery_time}`,
    parseInt(`${req.query.minPrice}`),
    parseInt(`${req.query.maxPrice}`)
  );

  for (const item of gigs.hits) {
    resultsHits.push(item._source as ISellerGig);
  }

  if (type === 'backward') {
    resultsHits = sortBy(resultsHits, ['sortId']);
  }

  res.status(StatusCodes.OK).json({ message: 'Search gigs results', total: gigs.total, gigs: resultsHits });
};
