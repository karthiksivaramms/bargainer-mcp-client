/**
 * Example usage of the Bargainer MCP Client
 * This demonstrates how to use the MCP tools to search and manage deals
 */

// Example MCP tool calls that can be made to the server

// 1. Search for gaming laptops under $1500
const searchGamingLaptops = {
  tool: 'search_deals',
  arguments: {
    query: 'gaming laptop',
    category: 'electronics',
    maxPrice: 1500,
    minRating: 4.0,
    sortBy: 'price',
    sortOrder: 'asc',
    limit: 20,
    sources: ['slickdeals', 'rapidapi']
  }
};

// 2. Get top deals from all sources
const getTopDeals = {
  tool: 'get_top_deals',
  arguments: {
    limit: 50
  }
};

// 3. Filter deals by specific criteria
const filterElectronicsDeals = {
  tool: 'filter_deals',
  arguments: {
    deals: [], // Array of deals from previous search
    categories: ['electronics', 'computers'],
    priceRange: {
      min: 100,
      max: 2000
    },
    ratingRange: {
      min: 4.0,
      max: 5.0
    },
    stores: ['amazon', 'best buy', 'newegg']
  }
};

// 4. Get detailed information about a specific deal
const getDealDetails = {
  tool: 'get_deal_details',
  arguments: {
    dealId: 'deal_12345',
    source: 'slickdeals'
  }
};

// 5. Compare similar deals to find the best option
const compareDeals = {
  tool: 'compare_deals',
  arguments: {
    deals: [] // Array of similar deals to compare
  }
};

// 6. Get available sources
const getAvailableSources = {
  tool: 'get_available_sources',
  arguments: {}
};

// Example workflow for finding the best iPhone deals
const findBestIPhoneDeals = [
  // Step 1: Search for iPhone deals
  {
    tool: 'search_deals',
    arguments: {
      query: 'iPhone 15 Pro',
      category: 'electronics',
      maxPrice: 1200,
      minRating: 4.5,
      sortBy: 'price',
      limit: 30
    }
  },
  // Step 2: Filter results further
  {
    tool: 'filter_deals',
    arguments: {
      // deals array from step 1 results
      priceRange: { min: 800, max: 1100 },
      stores: ['amazon', 'apple', 'best buy', 'costco']
    }
  },
  // Step 3: Compare the filtered deals
  {
    tool: 'compare_deals',
    arguments: {
      // deals array from step 2 results
    }
  }
];

// Example of searching for home appliances with specific requirements
const searchHomeAppliances = {
  tool: 'search_deals',
  arguments: {
    query: 'smart refrigerator stainless steel',
    category: 'home-garden',
    minPrice: 800,
    maxPrice: 2500,
    minRating: 4.0,
    sortBy: 'rating',
    sortOrder: 'desc',
    limit: 15,
    sources: ['slickdeals', 'dealnews']
  }
};

export {
  searchGamingLaptops,
  getTopDeals,
  filterElectronicsDeals,
  getDealDetails,
  compareDeals,
  getAvailableSources,
  findBestIPhoneDeals,
  searchHomeAppliances
};
