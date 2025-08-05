# MCP Configuration for Claude Desktop

To use the Bargainer MCP Client with Claude Desktop, add this configuration to your MCP settings file.

## Configuration File Location

### Windows
```
%APPDATA%\Claude\claude_desktop_config.json
```

### macOS
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Linux
```
~/.config/Claude/claude_desktop_config.json
```

## Configuration

```json
{
  "mcpServers": {
    "bargainer": {
      "command": "node",
      "args": [
        "C:/Users/kmurugesan/OneDrive/Apps/Bargainer/dist/index.js"
      ],
      "env": {
        "SLICKDEALS_API_KEY": "your_slickdeals_api_key_here",
        "RAPIDAPI_KEY": "your_rapidapi_key_here",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Setup Steps

1. **Build the project** (if not already done):
   ```bash
   cd "C:/Users/kmurugesan/OneDrive/Apps/Bargainer"
   npm run build
   ```

2. **Get your API keys**:
   - **Slickdeals**: Register at https://slickdeals.net/api
   - **RapidAPI**: Sign up at https://rapidapi.com and subscribe to deal APIs

3. **Create/Edit the Claude config file**:
   - Create the file if it doesn't exist
   - Add the configuration above with your actual API keys and file paths

4. **Restart Claude Desktop** to load the new MCP server

## Usage Examples

Once configured, you can use these prompts in Claude:

### Search for Deals
```
Find me the best gaming laptop deals under $1500
```

### Get Top Deals
```
Show me the top 10 deals trending right now
```

### Category-Specific Search
```
Search for home appliances deals from Amazon and Best Buy
```

### Compare Deals
```
Find iPhone 15 deals and compare prices across different stores
```

### Advanced Filtering
```
Find wireless headphones under $200 with at least 4-star ratings, sorted by price
```

## Verification

To verify the MCP server is working:

1. Start Claude Desktop
2. Look for any error messages in the Claude Desktop logs
3. Try a simple query like: "What deal sources are available?"
4. The server should respond with available sources (slickdeals, rapidapi, etc.)

## Troubleshooting

### Common Issues

1. **"MCP server failed to start"**
   - Check that Node.js is installed and accessible
   - Verify the path to the built JavaScript files is correct
   - Ensure all dependencies are installed (`npm install`)

2. **"No tools available"**
   - Check API keys are properly set in the configuration
   - Verify the server builds without errors (`npm run build`)
   - Check Claude Desktop logs for specific error messages

3. **"Permission denied"**
   - Ensure Claude Desktop has permission to execute Node.js
   - Check file permissions on the project directory

### Debug Configuration

For debugging, you can add debug output:

```json
{
  "mcpServers": {
    "bargainer": {
      "command": "node",
      "args": [
        "C:/Users/kmurugesan/OneDrive/Apps/Bargainer/dist/index.js"
      ],
      "env": {
        "SLICKDEALS_API_KEY": "your_key_here",
        "RAPIDAPI_KEY": "your_key_here",
        "NODE_ENV": "development",
        "DEBUG": "true"
      }
    }
  }
}
```

## Alternative: Running Without API Keys

If you don't have API keys yet, you can still test with web scraping sources:

```json
{
  "mcpServers": {
    "bargainer": {
      "command": "node",
      "args": [
        "C:/Users/kmurugesan/OneDrive/Apps/Bargainer/dist/index.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "ENABLE_WEB_SCRAPING": "true"
      }
    }
  }
}
```

This will enable basic deal searching from public sources that don't require API keys.
