import { BargainerMCPServer } from '../src/server.js';

async function testMCPServer() {
  console.log('Testing Bargainer MCP Server...\n');

  try {
    // Create server instance
    const server = new BargainerMCPServer();
    
    // Test data
    const searchQueries = [
      {
        query: 'gaming laptop',
        maxPrice: 1500,
        category: 'electronics'
      },
      {
        query: 'wireless headphones',
        minRating: 4.0,
        sortBy: 'rating'
      },
      {
        query: 'kitchen appliances',
        store: 'amazon',
        limit: 10
      }
    ];

    console.log('Available deal sources:');
    // This would need to be adapted for actual testing
    console.log('- Slickdeals (requires API key)');
    console.log('- RapidAPI Deals (requires API key)');
    console.log('- DealNews (web scraping)');
    console.log('- RetailMeNot (web scraping)\n');

    console.log('Sample search queries that can be tested:');
    searchQueries.forEach((query, index) => {
      console.log(`${index + 1}. Query: "${query.query}"`);
      console.log(`   Filters: ${JSON.stringify(query, null, 2)}\n`);
    });

    console.log('To test the MCP server:');
    console.log('1. Set up your API keys in .env file');
    console.log('2. Run: npm run dev');
    console.log('3. Connect to the server via MCP client');
    console.log('4. Use the available tools to search for deals\n');

    console.log('Available MCP tools:');
    console.log('- search_deals: Search for deals with filters');
    console.log('- get_top_deals: Get trending/popular deals');
    console.log('- filter_deals: Filter existing deals');
    console.log('- get_deal_details: Get detailed deal information');
    console.log('- compare_deals: Compare similar deals');
    console.log('- get_available_sources: List active deal sources');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testMCPServer();
