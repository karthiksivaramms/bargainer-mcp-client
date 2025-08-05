import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { DealAggregator } from './services/aggregator.js';
import { SlickdealsProvider, RapidApiDealProvider, WebScrapingProvider } from './providers/index.js';
import { SearchParamsSchema, FilterSchema } from './types.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class BargainerMCPServer {
  private server: Server;
  private aggregator: DealAggregator;

  constructor() {
    this.server = new Server(
      {
        name: 'bargainer-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.aggregator = new DealAggregator();
    this.setupProviders();
    this.setupTools();
  }

  private setupProviders(): void {
    // Setup Slickdeals provider
    if (process.env.SLICKDEALS_API_KEY) {
      const slickdealsProvider = new SlickdealsProvider({
        name: 'slickdeals',
        baseUrl: process.env.SLICKDEALS_BASE_URL || 'https://slickdeals.net',
        apiKey: process.env.SLICKDEALS_API_KEY,
        enabled: true
      });
      this.aggregator.addProvider('slickdeals', slickdealsProvider);
    }

    // Setup RapidAPI deals provider
    if (process.env.RAPIDAPI_KEY) {
      const rapidApiProvider = new RapidApiDealProvider({
        name: 'rapidapi',
        baseUrl: process.env.RAPIDAPI_DEALS_URL || 'https://deals-scraper.p.rapidapi.com',
        enabled: true
      }, process.env.RAPIDAPI_KEY);
      this.aggregator.addProvider('rapidapi', rapidApiProvider);
    }

    // Setup additional deal sites via web scraping
    const additionalSites = [
      {
        name: 'dealnews',
        baseUrl: 'https://www.dealnews.com',
        enabled: true
      },
      {
        name: 'retailmenot',
        baseUrl: 'https://www.retailmenot.com',
        enabled: true
      }
    ];

    additionalSites.forEach(site => {
      const provider = new WebScrapingProvider(site);
      this.aggregator.addProvider(site.name, provider);
    });
  }

  private setupTools(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_deals':
            return await this.handleSearchDeals(args);
          case 'get_top_deals':
            return await this.handleGetTopDeals(args);
          case 'filter_deals':
            return await this.handleFilterDeals(args);
          case 'get_deal_details':
            return await this.handleGetDealDetails(args);
          case 'compare_deals':
            return await this.handleCompareDeals(args);
          case 'get_available_sources':
            return await this.handleGetAvailableSources();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private getAvailableTools(): Tool[] {
    return [
      {
        name: 'search_deals',
        description: 'Search for deals across multiple sources based on text query and filters',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for deals (e.g., "gaming laptop", "iPhone", "kitchen appliances")',
            },
            category: {
              type: 'string',
              description: 'Category filter (e.g., "electronics", "clothing", "home")',
            },
            minPrice: {
              type: 'number',
              description: 'Minimum price filter',
            },
            maxPrice: {
              type: 'number',
              description: 'Maximum price filter',
            },
            minRating: {
              type: 'number',
              description: 'Minimum rating filter (0-5)',
            },
            store: {
              type: 'string',
              description: 'Store/retailer filter (e.g., "amazon", "best buy")',
            },
            sortBy: {
              type: 'string',
              enum: ['price', 'rating', 'popularity', 'date'],
              description: 'Sort criteria',
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort order',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (1-100)',
              minimum: 1,
              maximum: 100,
            },
            sources: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific sources to search (e.g., ["slickdeals", "rapidapi"])',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_top_deals',
        description: 'Get top/trending deals from all or specific sources',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of deals to return',
              default: 20,
            },
            sources: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific sources to get deals from',
            },
          },
        },
      },
      {
        name: 'filter_deals',
        description: 'Filter deals using advanced criteria',
        inputSchema: {
          type: 'object',
          properties: {
            deals: {
              type: 'array',
              description: 'Array of deals to filter',
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Categories to include',
            },
            stores: {
              type: 'array',
              items: { type: 'string' },
              description: 'Stores to include',
            },
            priceRange: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
              },
              description: 'Price range filter',
            },
            ratingRange: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
              },
              description: 'Rating range filter',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags to filter by',
            },
          },
          required: ['deals'],
        },
      },
      {
        name: 'get_deal_details',
        description: 'Get detailed information about a specific deal',
        inputSchema: {
          type: 'object',
          properties: {
            dealId: {
              type: 'string',
              description: 'The ID of the deal to get details for',
            },
            source: {
              type: 'string',
              description: 'The source of the deal (optional)',
            },
          },
          required: ['dealId'],
        },
      },
      {
        name: 'compare_deals',
        description: 'Compare similar deals and find the best options',
        inputSchema: {
          type: 'object',
          properties: {
            deals: {
              type: 'array',
              description: 'Array of deals to compare',
            },
          },
          required: ['deals'],
        },
      },
      {
        name: 'get_available_sources',
        description: 'Get list of available deal sources/providers',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  private async handleSearchDeals(args: any) {
    const params = SearchParamsSchema.parse(args);
    const deals = await this.aggregator.searchDeals(params);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            results: deals.length,
            deals: deals.map(deal => ({
              id: deal.id,
              title: deal.title,
              price: deal.price,
              originalPrice: deal.originalPrice,
              discountPercentage: deal.discountPercentage,
              rating: deal.rating,
              store: deal.store,
              url: deal.url,
              source: deal.source,
              verified: deal.verified
            }))
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetTopDeals(args: any) {
    const { limit = 20, sources } = args;
    const deals = await this.aggregator.getTopDeals(limit, sources);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            results: deals.length,
            deals: deals.map(deal => ({
              id: deal.id,
              title: deal.title,
              price: deal.price,
              originalPrice: deal.originalPrice,
              discountPercentage: deal.discountPercentage,
              rating: deal.rating,
              store: deal.store,
              url: deal.url,
              source: deal.source,
              popularity: deal.popularity
            }))
          }, null, 2),
        },
      ],
    };
  }

  private async handleFilterDeals(args: any) {
    const { deals, ...filterOptions } = args;
    const filter = FilterSchema.parse(filterOptions);
    const filteredDeals = this.aggregator.filterDeals(deals, filter);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            original_count: deals.length,
            filtered_count: filteredDeals.length,
            deals: filteredDeals
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetDealDetails(args: any) {
    const { dealId, source } = args;
    const deal = await this.aggregator.getDealDetails(dealId, source);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: deal !== null,
            deal: deal
          }, null, 2),
        },
      ],
    };
  }

  private async handleCompareDeals(args: any) {
    const { deals } = args;
    const bestDeals = this.aggregator.compareDeals(deals);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            original_count: deals.length,
            best_deals_count: bestDeals.length,
            best_deals: bestDeals
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetAvailableSources() {
    const sources = this.aggregator.getProviders();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            sources: sources
          }, null, 2),
        },
      ],
    };
  }

  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Bargainer MCP Server running on stdio');
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new BargainerMCPServer();
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
