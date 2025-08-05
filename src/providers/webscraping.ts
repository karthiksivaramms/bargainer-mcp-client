import { BaseDealProvider } from './base.js';
import { Deal, SearchParams } from '../types.js';
import * as cheerio from 'cheerio';

export class WebScrapingProvider extends BaseDealProvider {
  async searchDeals(params: SearchParams): Promise<Deal[]> {
    // This is a generic web scraping provider that can be adapted for various deal sites
    // For demonstration, implementing a basic structure
    try {
      const deals: Deal[] = [];
      
      // Example scraping logic for generic deal sites
      const searchUrl = `${this.source.baseUrl}/search?q=${encodeURIComponent(params.query)}`;
      const response = await this.client.get(searchUrl);
      
      const $ = cheerio.load(response.data);
      
      // Generic selectors - would need to be customized per site
      $('.deal-item, .product-item, .offer-item').each((index: number, element: any) => {
        const deal = this.extractDealFromElement($, element);
        if (deal) {
          deals.push(deal);
        }
      });
      
      return deals.slice(0, params.limit);
    } catch (error) {
      console.error('Web scraping search error:', error);
      return [];
    }
  }

  async getTopDeals(limit: number = 20): Promise<Deal[]> {
    try {
      const deals: Deal[] = [];
      const response = await this.client.get('/hot-deals');
      
      const $ = cheerio.load(response.data);
      
      $('.deal-item, .product-item, .offer-item').each((index: number, element: any) => {
        if (index >= limit) return false;
        
        const deal = this.extractDealFromElement($, element);
        if (deal) {
          deals.push(deal);
        }
      });
      
      return deals;
    } catch (error) {
      console.error('Web scraping top deals error:', error);
      return [];
    }
  }

  async getDealDetails(dealId: string): Promise<Deal | null> {
    try {
      const response = await this.client.get(`/deal/${dealId}`);
      const $ = cheerio.load(response.data);
      
      return this.extractDealFromPage($);
    } catch (error) {
      console.error('Web scraping deal details error:', error);
      return null;
    }
  }

  private extractDealFromElement($: cheerio.CheerioAPI, element: any): Deal | null {
    try {
      const $el = $(element);
      
      const title = $el.find('.title, .deal-title, .product-title, h3, h2').first().text().trim();
      const priceText = $el.find('.price, .deal-price, .current-price').first().text().trim();
      const originalPriceText = $el.find('.original-price, .list-price, .was-price').first().text().trim();
      const url = $el.find('a').first().attr('href');
      const imageUrl = $el.find('img').first().attr('src');
      const store = $el.find('.store, .merchant, .retailer').first().text().trim();
      
      if (!title || !url) return null;
      
      const price = this.normalizePrice(priceText);
      const originalPrice = this.normalizePrice(originalPriceText);
      
      return {
        id: `scraped_${Date.now()}_${Math.random()}`,
        title,
        price,
        originalPrice,
        discountPercentage: originalPrice && price ? 
          this.calculateDiscount(originalPrice, price) : undefined,
        store: store || this.source.name,
        url: url.startsWith('http') ? url : `${this.source.baseUrl}${url}`,
        imageUrl: imageUrl?.startsWith('http') ? imageUrl : 
          (imageUrl ? `${this.source.baseUrl}${imageUrl}` : undefined),
        source: this.source.name,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting deal:', error);
      return null;
    }
  }

  private extractDealFromPage($: cheerio.CheerioAPI): Deal | null {
    try {
      const title = $('h1, .deal-title, .product-title').first().text().trim();
      const description = $('.description, .deal-description, .product-description').first().text().trim();
      const priceText = $('.price, .deal-price, .current-price').first().text().trim();
      const originalPriceText = $('.original-price, .list-price, .was-price').first().text().trim();
      const store = $('.store, .merchant, .retailer').first().text().trim();
      const ratingText = $('.rating, .stars').first().text().trim();
      
      if (!title) return null;
      
      const price = this.normalizePrice(priceText);
      const originalPrice = this.normalizePrice(originalPriceText);
      const rating = this.normalizeRating(ratingText);
      
      return {
        id: `scraped_detail_${Date.now()}`,
        title,
        description,
        price,
        originalPrice,
        discountPercentage: originalPrice && price ? 
          this.calculateDiscount(originalPrice, price) : undefined,
        rating,
        store: store || this.source.name,
        url: this.source.baseUrl,
        source: this.source.name,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting deal from page:', error);
      return null;
    }
  }
}
