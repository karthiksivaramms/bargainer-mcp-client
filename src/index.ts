import { BargainerMCPServer } from './server.js';

// Main entry point
async function main() {
  try {
    const server = new BargainerMCPServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start Bargainer MCP Server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the application
main();
