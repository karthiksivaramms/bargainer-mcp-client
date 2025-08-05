# Bargainer MCP Client - Setup Guide

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- NPM or Yarn package manager
- API keys for deal sources (optional, see below)

### 2. Installation

```bash
# Clone or download the project
cd bargainer-mcp-client

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Build the project
npm run build
```

### 3. Configuration

Edit the `.env` file with your API keys:

```bash
# Required for full functionality
SLICKDEALS_API_KEY=your_slickdeals_api_key
RAPIDAPI_KEY=your_rapidapi_key

# Optional additional sources
DEALS_API_KEY=your_additional_api_key

# Server configuration
PORT=3000
NODE_ENV=production
```

### 4. Running the MCP Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

### 5. API Keys Setup

#### Slickdeals API
1. Visit https://slickdeals.net/api
2. Register for developer access
3. Get your API key
4. Add to `.env` file

#### RapidAPI
1. Visit https://rapidapi.com
2. Sign up for an account
3. Subscribe to deal-related APIs:
   - [Deals Scraper API](https://rapidapi.com/deals-scraper)
   - [Product Hunt Deals](https://rapidapi.com/product-hunt)
   - [Coupon API](https://rapidapi.com/coupon-api)
4. Copy your RapidAPI key to `.env`

### 6. Testing the Setup

```bash
# Run the test script
npm run test

# Or test individual components
node dist/test/test-server.js
```

## MCP Client Integration

### Using with Claude Desktop

1. Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "bargainer": {
      "command": "node",
      "args": ["path/to/bargainer/dist/index.js"],
      "env": {
        "SLICKDEALS_API_KEY": "your_key_here",
        "RAPIDAPI_KEY": "your_key_here"
      }
    }
  }
}
```

2. Restart Claude Desktop

3. You should now have access to deal search tools in Claude

### Using with Other MCP Clients

The server implements the standard MCP protocol and can be used with any MCP-compatible client:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'my-app',
  version: '1.0.0'
}, {
  capabilities: {}
});

// Connect to the server
await client.connect(transport);

// Use the tools
const deals = await client.callTool({
  name: 'search_deals',
  arguments: {
    query: 'gaming laptop',
    maxPrice: 1500
  }
});
```

## Available Tools

### 1. search_deals
Search for deals across multiple sources.

**Parameters:**
- `query` (required): Search term
- `category`: Filter by category
- `minPrice`, `maxPrice`: Price range
- `minRating`: Minimum rating filter
- `store`: Specific store filter
- `sortBy`: Sort criteria (price, rating, popularity, date)
- `limit`: Number of results (max 100)
- `sources`: Specific sources to search

**Example:**
```json
{
  "name": "search_deals",
  "arguments": {
    "query": "wireless headphones",
    "category": "electronics",
    "maxPrice": 200,
    "minRating": 4.0,
    "limit": 10
  }
}
```

### 2. get_top_deals
Get trending/popular deals.

**Parameters:**
- `limit`: Number of deals to return
- `sources`: Specific sources to query

### 3. filter_deals
Filter an existing array of deals.

**Parameters:**
- `deals`: Array of deals to filter
- `categories`: Categories to include
- `stores`: Stores to include
- `priceRange`: Min/max price filter
- `ratingRange`: Min/max rating filter

### 4. get_deal_details
Get detailed information about a specific deal.

**Parameters:**
- `dealId`: The deal ID
- `source`: Source name (optional)

### 5. compare_deals
Compare similar deals to find the best options.

**Parameters:**
- `deals`: Array of deals to compare

### 6. get_available_sources
List all configured deal sources.

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that Node.js version is 18+

2. **API rate limit errors**
   - Check your API key limits
   - Implement caching or reduce request frequency

3. **No deals found**
   - Verify API keys are correct
   - Check if sources are configured properly
   - Try broader search terms

4. **Permission errors**
   - Ensure the process has write permissions for logs
   - Check firewall settings if running as server

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development npm run dev
```

### Logs

Server logs are written to:
- Console output (development)
- Log files in `logs/` directory (production)

## Advanced Configuration

### Adding Custom Deal Sources

1. Create a new provider class:

```typescript
export class CustomDealProvider extends BaseDealProvider {
  async searchDeals(params: SearchParams): Promise<Deal[]> {
    // Implementation
  }
  
  async getTopDeals(limit?: number): Promise<Deal[]> {
    // Implementation
  }
  
  async getDealDetails(dealId: string): Promise<Deal | null> {
    // Implementation
  }
}
```

2. Register the provider in `server.ts`:

```typescript
const customProvider = new CustomDealProvider({
  name: 'custom-source',
  baseUrl: 'https://api.customdeals.com',
  apiKey: process.env.CUSTOM_API_KEY
});

this.aggregator.addProvider('custom-source', customProvider);
```

### Rate Limiting

Configure rate limits in `.env`:

```bash
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_REQUESTS=1000  # Max requests per window
```

### Caching

Enable result caching:

```bash
ENABLE_CACHING=true
CACHE_TTL=300  # 5 minutes
REDIS_URL=redis://localhost:6379  # Optional Redis cache
```

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the API documentation in `docs/api-sources.md`
3. Open an issue on the project repository
4. Check the examples in `examples/` directory
