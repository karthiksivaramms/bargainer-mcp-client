import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { spawn } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BargainerWebServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.mcpProcess = null;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  setupMiddleware() {
    // Serve static files from ui directory
    this.app.use(express.static(join(__dirname, '../ui')));
    this.app.use(express.json());
  }

  setupRoutes() {
    // Serve the chat interface
    this.app.get('/', (req, res) => {
      res.sendFile(join(__dirname, '../ui/index.html'));
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'running', 
        mcpConnected: !!this.mcpProcess,
        timestamp: new Date().toISOString()
      });
    });

    // API endpoint to get available sources
    this.app.get('/api/sources', async (req, res) => {
      try {
        const result = await this.callMCPTool('get_available_sources', {});
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API endpoint for deal search
    this.app.post('/api/search', async (req, res) => {
      try {
        const { query, category, maxPrice, minPrice, limit = 10 } = req.body;
        const result = await this.callMCPTool('search_deals', {
          query,
          category,
          maxPrice,
          minPrice,
          limit
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle chat messages
      socket.on('chat_message', async (data) => {
        try {
          const { message, intent } = data;
          console.log('Processing message:', message);

          let response;
          switch (intent.type) {
            case 'search_deals':
              response = await this.callMCPTool('search_deals', {
                query: intent.query,
                category: intent.category,
                maxPrice: intent.maxPrice,
                minPrice: intent.minPrice,
                limit: 5
              });
              break;
            
            case 'top_deals':
              response = await this.callMCPTool('get_top_deals', {
                limit: 5,
                category: intent.category
              });
              break;
            
            case 'compare_deals':
              // First search, then compare
              const searchResponse = await this.callMCPTool('search_deals', {
                query: intent.query,
                limit: 10
              });
              response = await this.callMCPTool('compare_deals', {
                deals: searchResponse.deals
              });
              break;
            
            default:
              response = await this.callMCPTool('search_deals', {
                query: message,
                limit: 3
              });
          }

          socket.emit('chat_response', {
            success: true,
            data: response,
            intent: intent
          });
        } catch (error) {
          console.error('Error processing message:', error);
          socket.emit('chat_response', {
            success: false,
            error: error.message
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  async callMCPTool(toolName, params) {
    // This is a simplified version - in a real implementation,
    // you would connect to the actual MCP server
    return this.mockMCPCall(toolName, params);
  }

  mockMCPCall(toolName, params) {
    // Mock implementation with sample data
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
        title: "Apple iPhone 15 Pro 128GB",
        price: 899.99,
        originalPrice: 999.99,
        discountPercentage: 10,
        rating: 4.7,
        reviewCount: 892,
        category: "electronics",
        store: "Target",
        url: "https://target.com/iphone-15",
        source: "dealnews",
        verified: true,
        popularity: 92
      }
    ];

    switch (toolName) {
      case 'search_deals':
        let results = [...mockDeals];
        
        if (params.query) {
          const query = params.query.toLowerCase();
          results = results.filter(deal => 
            deal.title.toLowerCase().includes(query) ||
            deal.category.toLowerCase().includes(query)
          );
        }
        
        if (params.category) {
          results = results.filter(deal => deal.category === params.category);
        }
        
        if (params.maxPrice) {
          results = results.filter(deal => deal.price <= params.maxPrice);
        }
        
        return {
          success: true,
          results: results.length,
          deals: results.slice(0, params.limit || 10)
        };

      case 'get_top_deals':
        return {
          success: true,
          results: mockDeals.length,
          deals: mockDeals.slice(0, params.limit || 10)
        };

      case 'compare_deals':
        const bestDeal = mockDeals[0]; // Simplified
        return {
          success: true,
          best_deal: bestDeal,
          analysis: "Compared based on discount percentage and customer ratings."
        };

      case 'get_available_sources':
        return {
          success: true,
          sources: ['slickdeals', 'rapidapi', 'dealnews', 'retailmenot']
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  start(port = 3001) {
    this.server.listen(port, () => {
      console.log(`🚀 Bargainer Web Server running on http://localhost:${port}`);
      console.log(`💬 Chat UI available at http://localhost:${port}`);
      console.log(`📊 Health check at http://localhost:${port}/health`);
    });
  }
}

// Start the server
const server = new BargainerWebServer();
server.start(process.env.WEB_PORT || 3001);
