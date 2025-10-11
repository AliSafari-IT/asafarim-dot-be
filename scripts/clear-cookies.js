#!/usr/bin/env node

/**
 * Cookie clearing service for asafarim.be
 * This service provides an HTTP endpoint to clear cookies using Clear-Site-Data header
 */

const http = require('http');
const url = require('url');

const PORT = 3099;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse the URL
  const parsedUrl = url.parse(req.url, true);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle cookie clearing request
  if (req.method === 'GET' && parsedUrl.pathname === '/clear-cookies') {
    console.log(`[${new Date().toISOString()}] Cookie clearing request from ${req.socket.remoteAddress}`);

    // Set Clear-Site-Data header to clear cookies, storage, and cache
    res.setHeader('Clear-Site-Data', '"cookies", "storage", "cache"');
    res.setHeader('Content-Type', 'application/json');

    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      message: 'Clear-Site-Data header sent',
      timestamp: new Date().toISOString()
    }));

    console.log(`[${new Date().toISOString()}] Clear-Site-Data response sent`);
  } else {
    // Handle 404
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Endpoint not found'
    }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Cookie clearing service running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] Service shutting down`);
  server.close(() => {
    console.log(`[${new Date().toISOString()}] Server closed`);
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] Service terminating`);
  server.close(() => {
    console.log(`[${new Date().toISOString()}] Server closed`);
    process.exit(0);
  });
});
