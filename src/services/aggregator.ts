import { Deal, SearchParams, Filter } from '../types.js';
import { BaseDealProvider } from '../providers/base.js';

export class DealAggregator {
  private providers: Map<string, BaseDealProvider> = new Map();

  addProvider(name: string, provider: BaseDealProvider): void {
    this.providers.set(name, provider);
  }

  removeProvider(name: string): void {
    this.providers.delete(name);
  }

  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async searchDeals(params: SearchParams): Promise<Deal[]> {
    const selectedProviders = params.sources && params.sources.length > 0
      ? params.sources.filter((source: string) => this.providers.has(source))
      : Array.from(this.providers.keys());

    const searchPromises = selectedProviders.map(async (providerName: string) => {
      const provider = this.providers.get(providerName);
      if (!provider) return [];

      try {
        return await provider.searchDeals(params);
      } catch (error) {
        console.error(`Error searching deals from ${providerName}:`, error);
        return [];
      }
    });

    const results = await Promise.all(searchPromises);
    const allDeals = results.flat();

    return this.sortAndFilterDeals(allDeals, params);
  }

  async getTopDeals(limit: number = 20, sources?: string[]): Promise<Deal[]> {
    const selectedProviders = sources && sources.length > 0
      ? sources.filter(source => this.providers.has(source))
      : Array.from(this.providers.keys());

    const dealPromises = selectedProviders.map(async (providerName) => {
      const provider = this.providers.get(providerName);
      if (!provider) return [];

      try {
        return await provider.getTopDeals(Math.ceil(limit / selectedProviders.length));
      } catch (error) {
        console.error(`Error getting top deals from ${providerName}:`, error);
        return [];
      }
    });

    const results = await Promise.all(dealPromises);
    const allDeals = results.flat();

    return this.sortDeals(allDeals, 'popularity', 'desc').slice(0, limit);
  }

  async getDealDetails(dealId: string, source?: string): Promise<Deal | null> {
    if (source && this.providers.has(source)) {
      const provider = this.providers.get(source);
      return provider ? await provider.getDealDetails(dealId) : null;
    }

    // Try all providers if source not specified
    for (const provider of this.providers.values()) {
      try {
        const deal = await provider.getDealDetails(dealId);
        if (deal) return deal;
      } catch (error) {
        console.error(`Error getting deal details from ${provider.getSourceName()}:`, error);
      }
    }

    return null;
  }

  filterDeals(deals: Deal[], filter: Filter): Deal[] {
    return deals.filter(deal => {
      // Category filter
      if (filter.categories && filter.categories.length > 0) {
        if (!deal.category || !filter.categories.includes(deal.category.toLowerCase())) {
          return false;
        }
      }

      // Store filter
      if (filter.stores && filter.stores.length > 0) {
        if (!deal.store || !filter.stores.some((store: string) => 
          deal.store.toLowerCase().includes(store.toLowerCase()))) {
          return false;
        }
      }

      // Price range filter
      if (filter.priceRange) {
        if (filter.priceRange.min !== undefined && 
            (deal.price === undefined || deal.price < filter.priceRange.min)) {
          return false;
        }
        if (filter.priceRange.max !== undefined && 
            (deal.price === undefined || deal.price > filter.priceRange.max)) {
          return false;
        }
      }

      // Rating range filter
      if (filter.ratingRange) {
        if (filter.ratingRange.min !== undefined && 
            (deal.rating === undefined || deal.rating < filter.ratingRange.min)) {
          return false;
        }
        if (filter.ratingRange.max !== undefined && 
            (deal.rating === undefined || deal.rating > filter.ratingRange.max)) {
          return false;
        }
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        if (!deal.tags || !filter.tags.some((tag: string) => 
          deal.tags!.some((dealTag: string) => dealTag.toLowerCase().includes(tag.toLowerCase())))) {
          return false;
        }
      }

      return true;
    });
  }

  compareDeals(deals: Deal[]): Deal[] {
    // Group deals by similar titles and find best deals
    const groupedDeals = new Map<string, Deal[]>();
    
    deals.forEach(deal => {
      const normalizedTitle = this.normalizeTitle(deal.title);
      if (!groupedDeals.has(normalizedTitle)) {
        groupedDeals.set(normalizedTitle, []);
      }
      groupedDeals.get(normalizedTitle)!.push(deal);
    });

    const bestDeals: Deal[] = [];
    
    groupedDeals.forEach(similarDeals => {
      if (similarDeals.length > 1) {
        // Sort by price (lowest first) or by rating if prices are similar
        similarDeals.sort((a, b) => {
          if (a.price && b.price) {
            const priceDiff = a.price - b.price;
            if (Math.abs(priceDiff) < 5) {
              // If prices are within $5, prefer higher rating
              return (b.rating || 0) - (a.rating || 0);
            }
            return priceDiff;
          }
          return (b.rating || 0) - (a.rating || 0);
        });
      }
      bestDeals.push(similarDeals[0]);
    });

    return bestDeals;
  }

  private sortAndFilterDeals(deals: Deal[], params: SearchParams): Deal[] {
    let filteredDeals = deals;

    // Apply basic filters from search params
    if (params.minPrice !== undefined) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.price === undefined || deal.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.price === undefined || deal.price <= params.maxPrice!);
    }

    if (params.minRating !== undefined) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.rating === undefined || deal.rating >= params.minRating!);
    }

    if (params.store) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.store.toLowerCase().includes(params.store!.toLowerCase()));
    }

    // Sort deals
    const sortBy = params.sortBy || 'popularity';
    const sortOrder = params.sortOrder || 'desc';
    
    return this.sortDeals(filteredDeals, sortBy, sortOrder).slice(0, params.limit);
  }

  private sortDeals(deals: Deal[], sortBy: string, sortOrder: string): Deal[] {
    return deals.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'price':
          aValue = a.price || Infinity;
          bValue = b.price || Infinity;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'popularity':
          aValue = a.popularity || 0;
          bValue = b.popularity || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50); // Take first 50 chars for grouping
  }
}
