import { BaseDealProvider } from './base.js';
import { Deal, SearchParams } from '../types.js';

export class RapidApiDealProvider extends BaseDealProvider {
  constructor(source: any, rapidApiKey: string) {
    super({
      ...source,
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': new URL(source.baseUrl).hostname,
        ...source.headers
      }
    });
  }

  async searchDeals(params: SearchParams): Promise<Deal[]> {
    try {
      const searchParams = {
        query: params.query,
        ...(params.category && { category: params.category }),
        ...(params.minPrice && { min_price: params.minPrice }),
        ...(params.maxPrice && { max_price: params.maxPrice }),
        ...(params.store && { store: params.store }),
        limit: params.limit
      };

      const response = await this.client.get('/search', { params: searchParams });
      
      if (response.data && response.data.results) {
        return response.data.results.map((deal: any) => this.transformDeal(deal));
      }
      
      return [];
    } catch (error) {
      console.error('RapidAPI deals search error:', error);
      return [];
    }
  }

  async getTopDeals(limit: number = 20): Promise<Deal[]> {
    try {
      const response = await this.client.get('/trending', { 
        params: { limit } 
      });
      
      if (response.data && response.data.deals) {
        return response.data.deals.map((deal: any) => this.transformDeal(deal));
      }
      
      return [];
    } catch (error) {
      console.error('RapidAPI top deals error:', error);
      return [];
    }
  }

  async getDealDetails(dealId: string): Promise<Deal | null> {
    try {
      const response = await this.client.get(`/deal/${dealId}`);
      
      if (response.data) {
        return this.transformDeal(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('RapidAPI deal details error:', error);
      return null;
    }
  }

  private transformDeal(rawDeal: any): Deal {
    return {
      id: rawDeal.id || rawDeal.dealId || `rapid_${Date.now()}_${Math.random()}`,
      title: rawDeal.title || rawDeal.name || rawDeal.productName,
      description: rawDeal.description || rawDeal.summary,
      price: this.normalizePrice(rawDeal.price || rawDeal.currentPrice),
      originalPrice: this.normalizePrice(rawDeal.originalPrice || rawDeal.listPrice),
      discount: rawDeal.savings || rawDeal.discountAmount,
      discountPercentage: rawDeal.discountPercent || 
        (rawDeal.originalPrice && rawDeal.price ? 
          this.calculateDiscount(
            this.normalizePrice(rawDeal.originalPrice) || 0,
            this.normalizePrice(rawDeal.price) || 0
          ) : undefined),
      rating: this.normalizeRating(rawDeal.rating || rawDeal.stars),
      reviewCount: rawDeal.reviewCount || rawDeal.numReviews,
      category: rawDeal.category || rawDeal.department,
      store: rawDeal.store || rawDeal.merchant || rawDeal.retailer,
      url: rawDeal.url || rawDeal.link || rawDeal.dealUrl,
      imageUrl: rawDeal.image || rawDeal.imageUrl || rawDeal.thumbnail,
      expirationDate: rawDeal.expires || rawDeal.expirationDate,
      tags: rawDeal.tags || (rawDeal.categories ? rawDeal.categories : []),
      source: 'rapidapi',
      createdAt: rawDeal.dateAdded || rawDeal.publishDate || new Date().toISOString(),
      popularity: rawDeal.popularity || rawDeal.score,
      verified: rawDeal.verified || rawDeal.featured || false
    };
  }
}
