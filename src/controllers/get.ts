import { getUserSelectedGigCategory } from '@gig/redis/gig.cache';
import { getGigById, getSellerGigs, getSellerPausedGigs } from '@gig/services/gig.service';
import { getMoreGigsLikeThis, getTopRatedGigsByCategory, gigsSearchByCategory } from '@gig/services/search.service';
import { ISearchResult, ISellerGig } from '@vuphuc47edge/jobber-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const gigById = async (req: Request, res: Response): Promise<void> => {
  const gig: ISellerGig = await getGigById(req.params.gigId);
  res.status(StatusCodes.OK).json({ message: 'Get gig by id', gig });
};

export const sellerGigs = async (req: Request, res: Response): Promise<void> => {
  const gigs: ISellerGig[] = await getSellerGigs(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Seller gigs', gigs });
};

export const sellerInactiveGigs = async (req: Request, res: Response): Promise<void> => {
  const gigs: ISellerGig[] = await getSellerPausedGigs(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Seller gigs', gigs });
};

export const topRatedGigsByCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await getUserSelectedGigCategory(`selectedCategories:${req.params.username}`);
  const resultHits: ISellerGig[] = [];
  const gigs: ISearchResult = await getTopRatedGigsByCategory(`${category}`);

  for (const item of gigs.hits) {
    resultHits.push(item._source as ISellerGig);
  }

  res.status(StatusCodes.OK).json({ message: 'Search top gigs results', total: gigs.total, gigs: resultHits });
};

export const gigsByCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await getUserSelectedGigCategory(`selectedCategories:${req.params.username}`);
  const resultHits: ISellerGig[] = [];
  const gigs: ISearchResult = await gigsSearchByCategory(`${category}`);

  for (const item of gigs.hits) {
    resultHits.push(item._source as ISellerGig);
  }

  res.status(StatusCodes.OK).json({ message: 'Search gigs category results', total: gigs.total, gigs: resultHits });
};

export const moreLikeThis = async (req: Request, res: Response): Promise<void> => {
  const resultHits: ISellerGig[] = [];
  const gigs: ISearchResult = await getMoreGigsLikeThis(req.params.gigId);

  for (const item of gigs.hits) {
    resultHits.push(item._source as ISellerGig);
  }

  res.status(StatusCodes.OK).json({ message: 'More gigs like this result', total: gigs.total, gigs: resultHits });
};
