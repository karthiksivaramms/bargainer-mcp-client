import { BaseDealProvider } from './base.js';
import { Deal, SearchParams } from '../types.js';

export class SlickdealsProvider extends BaseDealProvider {
  async searchDeals(params: SearchParams): Promise<Deal[]> {
    try {
      const searchParams = new URLSearchParams({
        q: params.query,
        ...(params.category && { category: params.category }),
        ...(params.minPrice && { min_price: params.minPrice.toString() }),
        ...(params.maxPrice && { max_price: params.maxPrice.toString() }),
        ...(params.store && { store: params.store }),
        limit: params.limit.toString()
      });

      const response = await this.client.get(`/v2/deals/search?${searchParams}`);
      
      if (response.data && response.data.deals) {
        return response.data.deals.map((deal: any) => this.transformDeal(deal));
      }
      
      return [];
    } catch (error) {
      console.error('SlickDeals search error:', error);
      return [];
    }
  }

  async getTopDeals(limit: number = 20): Promise<Deal[]> {
    try {
      const response = await this.client.get(`/v2/deals/trending?limit=${limit}`);
      
      if (response.data && response.data.deals) {
        return response.data.deals.map((deal: any) => this.transformDeal(deal));
      }
      
      return [];
    } catch (error) {
      console.error('SlickDeals top deals error:', error);
      return [];
    }
  }

  async getDealDetails(dealId: string): Promise<Deal | null> {
    try {
      const response = await this.client.get(`/v2/deals/${dealId}`);
      
      if (response.data && response.data.deal) {
        return this.transformDeal(response.data.deal);
      }
      
      return null;
    } catch (error) {
      console.error('SlickDeals deal details error:', error);
      return null;
    }
  }

  private transformDeal(rawDeal: any): Deal {
    return {
      id: rawDeal.id || rawDeal.deal_id,
      title: rawDeal.title || rawDeal.deal_title,
      description: rawDeal.description || rawDeal.deal_description,
      price: this.normalizePrice(rawDeal.price || rawDeal.deal_price),
      originalPrice: this.normalizePrice(rawDeal.original_price || rawDeal.list_price),
      discount: rawDeal.discount_amount,
      discountPercentage: rawDeal.discount_percentage || 
        (rawDeal.original_price && rawDeal.price ? 
          this.calculateDiscount(
            this.normalizePrice(rawDeal.original_price) || 0,
            this.normalizePrice(rawDeal.price) || 0
          ) : undefined),
      rating: this.normalizeRating(rawDeal.rating || rawDeal.deal_rating),
      reviewCount: rawDeal.review_count || rawDeal.reviews,
      category: rawDeal.category || rawDeal.deal_category,
      store: rawDeal.store || rawDeal.merchant || rawDeal.retailer,
      url: rawDeal.url || rawDeal.deal_url || rawDeal.link,
      imageUrl: rawDeal.image_url || rawDeal.thumbnail || rawDeal.image,
      expirationDate: rawDeal.expiration_date || rawDeal.expires_at,
      tags: rawDeal.tags || (rawDeal.keywords ? rawDeal.keywords.split(',') : []),
      source: 'slickdeals',
      createdAt: rawDeal.created_at || rawDeal.posted_at || new Date().toISOString(),
      popularity: rawDeal.popularity || rawDeal.thumbs_up || rawDeal.likes,
      verified: rawDeal.verified || rawDeal.staff_pick || false
    };
  }
}
