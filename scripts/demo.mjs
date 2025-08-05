#!/usr/bin/env node

/**
 * Demo script to test the Bargainer MCP Client and show outcomes
 * This script simulates MCP tool calls and shows the results
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🛍️ Bargainer MCP Client - Demo & Testing\n');

// Mock MCP tool responses (since we need API keys for real data)
const mockDeals = [
  {
    id: "deal_001",
    title: "ASUS ROG Strix G15 Gaming Laptop - RTX 3060, Ryzen 7",
    price: 899.99,
    originalPrice: 1299.99,
    discountPercentage: 31,
    rating: 4.5,
    reviewCount: 1247,
    category: "electronics",
    store: "Best Buy",
    url: "https://bestbuy.com/deal/gaming-laptop",
    source: "slickdeals",
    verified: true,
    popularity: 95
  },
  {
    id: "deal_002", 
    title: "Sony WH-1000XM4 Wireless Noise Canceling Headphones",
    price: 199.99,
    originalPrice: 349.99,
    discountPercentage: 43,
    rating: 4.8,
    reviewCount: 3421,
    category: "electronics",
    store: "Amazon",
    url: "https://amazon.com/sony-headphones",
    source: "rapidapi",
    verified: true,
    popularity: 88
  },
  {
    id: "deal_003",
    title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Qt",
    price: 49.99,
    originalPrice: 99.99,
    discountPercentage: 50,
    rating: 4.6,
    reviewCount: 8934,
    category: "home-garden",
    store: "Target",
    url: "https://target.com/instant-pot",
    source: "dealnews",
    verified: false,
    popularity: 72
  }
];

function simulateMCPToolCall(toolName, args) {
  console.log(`🔧 Calling MCP Tool: ${toolName}`);
  console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));
  console.log('⏳ Processing...\n');
  
  switch (toolName) {
    case 'search_deals':
      return simulateSearchDeals(args);
    case 'get_top_deals':
      return simulateTopDeals(args);
    case 'filter_deals':
      return simulateFilterDeals(args);
    case 'get_deal_details':
      return simulateDealDetails(args);
    case 'compare_deals':
      return simulateCompareDeals(args);
    case 'get_available_sources':
      return simulateAvailableSources();
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

function simulateSearchDeals(args) {
  const { query, category, maxPrice, minRating } = args;
  
  let results = [...mockDeals];
  
  // Apply filters
  if (query) {
    results = results.filter(deal => 
      deal.title.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  if (category) {
    results = results.filter(deal => deal.category === category);
  }
  
  if (maxPrice) {
    results = results.filter(deal => deal.price <= maxPrice);
  }
  
  if (minRating) {
    results = results.filter(deal => deal.rating >= minRating);
  }
  
  return {
    success: true,
    results: results.length,
    deals: results.slice(0, args.limit || 20)
  };
}

function simulateTopDeals(args) {
  const sorted = [...mockDeals].sort((a, b) => b.popularity - a.popularity);
  return {
    success: true,
    results: sorted.length,
    deals: sorted.slice(0, args.limit || 10)
  };
}

function simulateFilterDeals(args) {
  const { deals, priceRange, ratingRange } = args;
  let filtered = deals || mockDeals;
  
  if (priceRange) {
    if (priceRange.min) {
      filtered = filtered.filter(deal => deal.price >= priceRange.min);
    }
    if (priceRange.max) {
      filtered = filtered.filter(deal => deal.price <= priceRange.max);
    }
  }
  
  if (ratingRange) {
    if (ratingRange.min) {
      filtered = filtered.filter(deal => deal.rating >= ratingRange.min);
    }
  }
  
  return {
    success: true,
    original_count: (deals || mockDeals).length,
    filtered_count: filtered.length,
    deals: filtered
  };
}

function simulateDealDetails(args) {
  const deal = mockDeals.find(d => d.id === args.dealId);
  return {
    success: !!deal,
    deal: deal || null
  };
}

function simulateCompareDeals(args) {
  const deals = args.deals || mockDeals;
  const bestDeal = deals.reduce((best, current) => {
    if (!best) return current;
    if (current.discountPercentage > best.discountPercentage) return current;
    if (current.discountPercentage === best.discountPercentage && current.rating > best.rating) return current;
    return best;
  }, null);
  
  return {
    success: true,
    original_count: deals.length,
    best_deal: bestDeal,
    analysis: "Compared based on discount percentage and rating"
  };
}

function simulateAvailableSources() {
  return {
    success: true,
    sources: ["slickdeals", "rapidapi", "dealnews", "retailmenot"]
  };
}

function formatDealOutput(deal) {
  console.log(`  📦 ${deal.title}`);
  console.log(`     💰 Price: $${deal.price} ${deal.originalPrice ? `(was $${deal.originalPrice})` : ''}`);
  if (deal.discountPercentage) {
    console.log(`     🏷️  Discount: ${deal.discountPercentage}% OFF`);
  }
  console.log(`     ⭐ Rating: ${deal.rating}/5 (${deal.reviewCount} reviews)`);
  console.log(`     🏪 Store: ${deal.store}`);
  console.log(`     🔗 Source: ${deal.source}${deal.verified ? ' ✅' : ''}`);
  console.log(`     🌐 URL: ${deal.url}`);
  console.log('');
}

async function runDemo() {
  try {
    console.log('🎯 Demo 1: Search for Gaming Laptops under $1000\n');
    const searchResult = simulateMCPToolCall('search_deals', {
      query: 'gaming laptop',
      category: 'electronics',
      maxPrice: 1000,
      minRating: 4.0,
      limit: 10
    });
    
    console.log('📊 Results:');
    console.log(`   Found ${searchResult.results} deals\n`);
    searchResult.deals.forEach(formatDealOutput);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('🎯 Demo 2: Get Top Trending Deals\n');
    const topDeals = simulateMCPToolCall('get_top_deals', { limit: 3 });
    
    console.log('📊 Top Deals:');
    topDeals.deals.forEach((deal, index) => {
      console.log(`\n🏆 #${index + 1} Most Popular Deal:`);
      formatDealOutput(deal);
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('🎯 Demo 3: Filter Deals by Price Range\n');
    const filterResult = simulateMCPToolCall('filter_deals', {
      deals: mockDeals,
      priceRange: { min: 100, max: 500 },
      ratingRange: { min: 4.5 }
    });
    
    console.log('📊 Filter Results:');
    console.log(`   Original: ${filterResult.original_count} deals`);
    console.log(`   After filtering: ${filterResult.filtered_count} deals\n`);
    filterResult.deals.forEach(formatDealOutput);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('🎯 Demo 4: Compare Deals to Find Best Option\n');
    const compareResult = simulateMCPToolCall('compare_deals', { deals: mockDeals });
    
    console.log('📊 Best Deal Analysis:');
    console.log(`   ${compareResult.analysis}\n`);
    console.log('🏆 Winner:');
    formatDealOutput(compareResult.best_deal);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('🎯 Demo 5: Available Deal Sources\n');
    const sourcesResult = simulateMCPToolCall('get_available_sources', {});
    
    console.log('📊 Active Sources:');
    sourcesResult.sources.forEach(source => {
      console.log(`   ✅ ${source}`);
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('🎉 Demo completed! Here\'s how to use the real MCP client:');
    console.log('');
    console.log('1. 🔑 Set up API keys in .env file:');
    console.log('   SLICKDEALS_API_KEY=your_key');
    console.log('   RAPIDAPI_KEY=your_key');
    console.log('');
    console.log('2. 🔧 Configure Claude Desktop:');
    console.log('   Add server config to claude_desktop_config.json');
    console.log('');
    console.log('3. 💬 Ask Claude questions like:');
    console.log('   "Find gaming laptop deals under $1500"');
    console.log('   "Show me top electronics deals"');
    console.log('   "Compare iPhone prices across stores"');
    console.log('');
    console.log('4. 🚀 Or run programmatically:');
    console.log('   npm run dev  # Start MCP server');
    console.log('   # Connect with MCP client and call tools');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
runDemo();
