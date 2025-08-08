# Bargainer MCP Client 🛍️

A powerful Model Context Protocol (MCP) client for finding and comparing deals from multiple sources including Slickdeals, RapidAPI marketplace, and web scraping. Features a modern web-based chat interface for interactive deal searching.

<a href="https://glama.ai/mcp/servers/@karthiksivaramms/bargainer-mcp-client">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@karthiksivaramms/bargainer-mcp-client/badge" alt="Bargainer Server MCP server" />
</a>

## Features ✨

- **Multi-Source Deal Aggregation**: Integrates with Slickdeals API, RapidAPI marketplace, and web scraping
- **Interactive Chat Interface**: Modern web UI with real-time messaging via Socket.IO
- **Intelligent Deal Filtering**: Filter by price, rating, store, and category
- **Deal Comparison**: Compare deals across multiple sources
- **MCP Protocol Integration**: Full Model Context Protocol implementation with 6 specialized tools
- **Provider Pattern Architecture**: Extensible design for adding new deal sources
- **TypeScript**: Fully typed codebase with strict type checking

## Quick Start 🚀

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for external services (optional, fallback to mock data)

### Installation

```bash
# Clone the repository
git clone https://github.com/karthiksivaramms/bargainer-mcp-client.git
cd bargainer-mcp-client

# Install dependencies
npm install

# Build the project
npm run build
```

### Usage

#### Web Chat Interface
```bash
# Start the web interface
npm run web

# Or with auto-reload for development
npm run dev:web
```

Then open http://localhost:3001 in your browser and start chatting!

#### MCP Server
```bash
# Start the MCP server
npm run dev

# Or run the built version
npm start
```

#### Demo & Testing
```bash
# Run interactive demo
npm run demo

# Test the server
npm run test:server
```

## Available Commands 💬

Use these natural language commands in the chat interface:

- **Search deals**: "Find laptop deals under $500"
- **Get top deals**: "Show me today's top electronics deals"
- **Filter deals**: "Gaming headphones under $100 with 4+ stars"
- **Deal details**: "Tell me more about this iPhone deal"
- **Compare deals**: "Compare iPad deals across sources"
- **List sources**: "What deal sources are available?"

## MCP Tools 🛠️

The server provides 6 specialized tools:

1. **search_deals** - Search for deals by product name or keywords
2. **get_top_deals** - Get trending deals from all sources
3. **filter_deals** - Filter deals by price, rating, store, category
4. **get_deal_details** - Get detailed information about specific deals
5. **compare_deals** - Compare deals across multiple sources
6. **get_available_sources** - List all configured deal sources

## Architecture 🏗️

```
src/
├── server.ts              # Main MCP server
├── providers/             # Deal source providers
│   ├── base.ts           # Base provider interface
│   ├── slickdeals.ts     # Slickdeals API provider
│   ├── rapidapi.ts       # RapidAPI marketplace provider
│   └── webscraping.ts    # Web scraping provider
├── services/
│   └── aggregator.ts     # Deal aggregation service
└── types/                # TypeScript type definitions

ui/
├── index.html            # Chat interface
├── chat-interface.js     # Frontend JavaScript
└── server.js             # Express server with Socket.IO

test/                     # Test files
scripts/                  # Utility scripts
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Install dependencies
npm install

# Start development with auto-reload
npm run dev

# Start web interface with auto-reload
npm run dev:web

# Run linting
npm run lint

# Format code
npm run format
```

### Adding New Deal Sources

1. Create a new provider in `src/providers/`
2. Extend `BaseDealProvider`
3. Implement required methods
4. Register in `aggregator.ts`

## API Documentation 📚

### Deal Object Structure

```typescript
interface Deal {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  store: string;
  url: string;
  imageUrl?: string;
  description?: string;
  category?: string;
  source: string;
  timestamp: Date;
}
```

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author 👨‍💻

**Karthik Sivaram M**

- GitHub: [@karthiksivaramms](https://github.com/karthiksivaramms)

## Support 💡

If you have any questions or run into issues, please [open an issue](https://github.com/karthiksivaramms/bargainer-mcp-client/issues) on GitHub.

## Roadmap 🗺️

- [ ] More deal source integrations
- [ ] Deal alerts and notifications
- [ ] Price history tracking
- [ ] Advanced filtering options
- [ ] Mobile app version
- [ ] Deal sharing features

---

Made with ❤️ for bargain hunters everywhere!