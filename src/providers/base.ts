import axios, { AxiosInstance } from 'axios';
import { Deal, SearchParams, DealSource, ApiResponse } from '../types.js';

export abstract class BaseDealProvider {
  protected client: AxiosInstance;
  protected source: DealSource;

  constructor(source: DealSource) {
    this.source = source;
    this.client = axios.create({
      baseURL: source.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...source.headers
      },
      timeout: 10000
    });

    // Add API key to headers if provided
    if (source.apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${source.apiKey}`;
    }
  }

  abstract searchDeals(params: SearchParams): Promise<Deal[]>;
  abstract getTopDeals(limit?: number): Promise<Deal[]>;
  abstract getDealDetails(dealId: string): Promise<Deal | null>;

  protected normalizePrice(price: string | number): number | undefined {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const numPrice = parseFloat(price.replace(/[^0-9.-]+/g, ''));
      return isNaN(numPrice) ? undefined : numPrice;
    }
    return undefined;
  }

  protected normalizeRating(rating: string | number): number | undefined {
    if (typeof rating === 'number') return rating;
    if (typeof rating === 'string') {
      const numRating = parseFloat(rating);
      return isNaN(numRating) ? undefined : numRating;
    }
    return undefined;
  }

  protected calculateDiscount(original: number, current: number): number {
    return Math.round(((original - current) / original) * 100);
  }

  public getSourceName(): string {
    return this.source.name;
  }
}
