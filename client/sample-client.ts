#!/usr/bin/env node

/**
 * Sample MCP client for testing the Bargainer server
 * This demonstrates how to connect to and use the MCP server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class BargainerMCPClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    this.client = new Client(
      {
        name: 'bargainer-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Start the MCP server process
    const serverProcess = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    this.transport = new StdioClientTransport({
      readable: serverProcess.stdout!,
      writable: serverProcess.stdin!,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect(this.transport);
    console.log('Connected to Bargainer MCP Server');
  }

  async listTools(): Promise<void> {
    const response = await this.client.listTools();
    console.log('Available tools:');
    response.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });
  }

  async searchDeals(query: string, options: any = {}): Promise<any> {
    console.log(`\nSearching for deals: "${query}"`);
    
    const response = await this.client.callTool('search_deals', {
      query,
      ...options
    });

    return JSON.parse(response.content[0].text);
  }

  async getTopDeals(limit: number = 10): Promise<any> {
    console.log(`\nGetting top ${limit} deals...`);
    
    const response = await this.client.callTool('get_top_deals', {
      limit
    });

    return JSON.parse(response.content[0].text);
  }

  async getAvailableSources(): Promise<any> {
    console.log('\nGetting available sources...');
    
    const response = await this.client.callTool('get_available_sources', {});
    return JSON.parse(response.content[0].text);
  }

  async close(): Promise<void> {
    await this.client.close();
    console.log('Disconnected from server');
  }
}

// Example usage
async function main() {
  const client = new BargainerMCPClient();

  try {
    await client.connect();
    
    // List available tools
    await client.listTools();
    
    // Get available sources
    const sources = await client.getAvailableSources();
    console.log('\nAvailable sources:', sources);
    
    // Search for gaming laptops
    const gamingLaptops = await client.searchDeals('gaming laptop', {
      category: 'electronics',
      maxPrice: 1500,
      limit: 5
    });
    console.log('\nGaming laptop deals:');
    gamingLaptops.deals?.forEach((deal: any, index: number) => {
      console.log(`${index + 1}. ${deal.title}`);
      console.log(`   Price: $${deal.price} | Store: ${deal.store} | Source: ${deal.source}`);
      if (deal.discountPercentage) {
        console.log(`   Discount: ${deal.discountPercentage}%`);
      }
      console.log(`   URL: ${deal.url}\n`);
    });

    // Get top deals
    const topDeals = await client.getTopDeals(5);
    console.log('\nTop deals:');
    topDeals.deals?.forEach((deal: any, index: number) => {
      console.log(`${index + 1}. ${deal.title}`);
      console.log(`   Price: $${deal.price} | Store: ${deal.store}`);
      console.log(`   Popularity: ${deal.popularity || 'N/A'}\n`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { BargainerMCPClient };
