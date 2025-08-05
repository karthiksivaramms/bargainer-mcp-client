# Deal API Sources Documentation

This document provides information about the deal API sources supported by the Bargainer MCP Client.

## Primary API Sources

### 1. Slickdeals API

**Website**: https://slickdeals.net
**API Documentation**: https://slickdeals.net/api

**Features**:
- Community-driven deal discovery
- User ratings and comments
- Deal verification system
- Category-based filtering
- Price alerts

**Authentication**: Requires API key
**Rate Limits**: 100 requests/hour (free tier)

**Endpoints Used**:
- `/v2/deals/search` - Search deals
- `/v2/deals/trending` - Get trending deals
- `/v2/deals/{id}` - Get deal details

### 2. RapidAPI Deal Aggregators

**Platform**: RapidAPI Marketplace
**Base URL**: Various endpoints on RapidAPI

**Popular Deal APIs on RapidAPI**:
- **Deals Scraper API**: Aggregates deals from multiple sources
- **Product Hunt Deals**: Tech product deals
- **Coupon API**: Coupon codes and discounts
- **Amazon Product API**: Amazon-specific deals

**Authentication**: RapidAPI key required
**Rate Limits**: Varies by API (typically 1000-10000 requests/month)

### 3. Web Scraping Sources

For sites without public APIs, the client uses web scraping:

#### DealNews
- **URL**: https://www.dealnews.com
- **Features**: Hand-picked deals, expert reviews
- **Categories**: Electronics, home, automotive, travel

#### RetailMeNot
- **URL**: https://www.retailmenot.com
- **Features**: Coupons, cashback offers
- **Focus**: Discount codes and promotional offers

#### Woot!
- **URL**: https://www.woot.com
- **Features**: Daily deals, limited-time offers
- **Specialty**: Electronics and gadgets

## Additional API Sources (Configurable)

### Public Deal APIs

1. **Best Buy API**
   - URL: https://bestbuyapis.github.io/api-documentation/
   - Features: Product information, pricing, availability
   - Authentication: API key required

2. **Amazon Product Advertising API**
   - URL: https://webservices.amazon.com/paapi5/documentation/
   - Features: Product details, pricing, reviews
   - Authentication: AWS credentials required

3. **eBay Browse API**
   - URL: https://developer.ebay.com/api-docs/buy/browse/overview.html
   - Features: Item search, deals, auctions
   - Authentication: OAuth token required

4. **Walmart Open API**
   - URL: https://developer.walmart.com/
   - Features: Product catalog, pricing
   - Authentication: API key required

### Deal Aggregator Services

1. **Honey API** (Partner access)
   - Features: Price tracking, coupon aggregation
   - Focus: Browser extension data

2. **Rakuten API** (Partner access)
   - Features: Cashback deals, store partnerships
   - Focus: Affiliate marketing deals

3. **Groupon API**
   - URL: https://partner-api.groupon.com/
   - Features: Local deals, experiences
   - Authentication: Partner credentials

## Configuration

To add new API sources, update the `src/config/sources.ts` file:

```typescript
export const API_SOURCES = {
  'new-source': {
    name: 'New Deal Source',
    baseUrl: 'https://api.newdealsource.com',
    authType: 'apikey', // or 'oauth', 'basic', 'none'
    endpoints: {
      search: '/deals/search',
      trending: '/deals/hot',
      details: '/deals/{id}'
    },
    rateLimit: 1000,
    categories: ['electronics', 'fashion', 'home'],
    enabled: true
  }
};
```

## Rate Limiting and Best Practices

1. **Respect API Limits**: Each source has different rate limits
2. **Cache Results**: Implement caching to reduce API calls
3. **Error Handling**: Graceful fallback when APIs are unavailable
4. **User-Agent**: Use appropriate user agents for web scraping
5. **Legal Compliance**: Ensure compliance with terms of service

## API Keys Setup

Create a `.env` file with your API keys:

```bash
# Primary sources
SLICKDEALS_API_KEY=your_slickdeals_key
RAPIDAPI_KEY=your_rapidapi_key

# Optional sources
BESTBUY_API_KEY=your_bestbuy_key
AMAZON_ACCESS_KEY=your_amazon_key
AMAZON_SECRET_KEY=your_amazon_secret
EBAY_CLIENT_ID=your_ebay_client_id
WALMART_API_KEY=your_walmart_key

# Rate limiting
ENABLE_RATE_LIMITING=true
CACHE_TTL=300
```

## Extending the Client

To add support for a new deal API:

1. Create a new provider class extending `BaseDealProvider`
2. Implement the required methods: `searchDeals`, `getTopDeals`, `getDealDetails`
3. Add the provider to the aggregator in `server.ts`
4. Update the configuration and documentation

Example:
```typescript
export class NewDealProvider extends BaseDealProvider {
  async searchDeals(params: SearchParams): Promise<Deal[]> {
    // Implementation specific to the new API
  }
  
  // ... other required methods
}
```
