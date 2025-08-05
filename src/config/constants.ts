export const DEAL_SOURCES = {
  slickdeals: {
    name: 'Slickdeals',
    baseUrl: 'https://slickdeals.net',
    apiUrl: 'https://slickdeals.net/api/v2',
    requiresAuth: true,
    description: 'Community-driven deals platform with user ratings and reviews'
  },
  rapidapi: {
    name: 'RapidAPI Deals',
    baseUrl: 'https://deals-scraper.p.rapidapi.com',
    requiresAuth: true,
    description: 'Aggregated deals from multiple e-commerce platforms'
  },
  dealnews: {
    name: 'DealNews',
    baseUrl: 'https://www.dealnews.com',
    requiresAuth: false,
    description: 'Hand-picked deals from major retailers'
  },
  retailmenot: {
    name: 'RetailMeNot',
    baseUrl: 'https://www.retailmenot.com',
    requiresAuth: false,
    description: 'Coupons and cashback deals'
  }
};

export const CATEGORIES = [
  'electronics',
  'computers',
  'home-garden',
  'clothing',
  'automotive',
  'sports-outdoors',
  'health-beauty',
  'toys-games',
  'books-media',
  'food-dining',
  'travel',
  'services'
];

export const POPULAR_STORES = [
  'amazon',
  'best-buy',
  'walmart',
  'target',
  'costco',
  'home-depot',
  'lowes',
  'macys',
  'newegg',
  'ebay'
];

export const DEFAULT_SEARCH_PARAMS = {
  limit: 20,
  sortBy: 'popularity',
  sortOrder: 'desc'
};

export const RATE_LIMITS = {
  slickdeals: 100, // requests per hour
  rapidapi: 1000,  // requests per hour
  webscraping: 60  // requests per hour
};
