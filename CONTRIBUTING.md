# Contributing to Bargainer MCP Client

Thank you for considering contributing to the Bargainer MCP Client! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check the [existing issues](https://github.com/karthiksivaramms/bargainer-mcp-client/issues) to avoid duplicates
2. Create a new issue with a clear title and description
3. Include steps to reproduce the bug (if applicable)
4. Add relevant labels

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/bargainer-mcp-client.git
   cd bargainer-mcp-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your API keys if testing with real APIs
   ```

### Making Changes

1. **Code Style**
   - Follow TypeScript best practices
   - Use meaningful variable and function names
   - Add JSDoc comments for public APIs
   - Run `npm run lint` and `npm run format` before committing

2. **Testing**
   - Add tests for new features
   - Ensure existing tests pass: `npm test`
   - Test both MCP server and web interface

3. **Commit Guidelines**
   - Use conventional commit format: `type(scope): description`
   - Examples:
     - `feat(providers): add new deal source provider`
     - `fix(ui): resolve chat message formatting issue`
     - `docs(readme): update installation instructions`

### Pull Request Process

1. **Before submitting**
   - Ensure all tests pass
   - Update documentation if needed
   - Add/update type definitions
   - Test with both mock and real data

2. **Pull Request**
   - Create a clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - List breaking changes (if any)

3. **Review Process**
   - Maintainers will review your PR
   - Address feedback promptly
   - Keep the PR up to date with main branch

## Project Structure

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
├── types/                # TypeScript type definitions
└── utils/                # Utility functions

ui/                       # Web interface
├── index.html           # Chat interface
├── chat-interface.js    # Frontend JavaScript
└── server.js            # Express server

test/                    # Test files
scripts/                 # Build and utility scripts
```

## Adding New Deal Sources

To add a new deal source provider:

1. **Create Provider**
   ```typescript
   // src/providers/your-source.ts
   import { BaseDealProvider } from './base.js';
   
   export class YourSourceProvider extends BaseDealProvider {
     async searchDeals(query: string): Promise<Deal[]> {
       // Implementation
     }
   }
   ```

2. **Register Provider**
   ```typescript
   // src/services/aggregator.ts
   import { YourSourceProvider } from '../providers/your-source.js';
   
   // Add to providers array
   ```

3. **Add Tests**
   ```typescript
   // test/providers/your-source.test.ts
   describe('YourSourceProvider', () => {
     // Test cases
   });
   ```

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers and answer questions
- Follow the project's coding standards

## Questions?

- Open an issue for general questions
- Check existing documentation
- Review closed issues for similar problems

Thank you for contributing! 🎉
