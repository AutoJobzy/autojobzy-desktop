#!/bin/bash

echo "🔍 Checking for saved search URL logs..."
echo ""

# Check if server is running
if pgrep -f "node.*server" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is NOT running"
    echo "Start server with: cd server && npm start"
    exit 1
fi

echo ""
echo "📋 Recent logs related to search URL:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Look for search URL related logs in recent output
# You can also check pm2 logs if using pm2
if command -v pm2 &> /dev/null; then
    pm2 logs --nostream --lines 100 | grep -i "search url\|finalUrl\|final_url" || echo "No URL logs found in PM2"
else
    echo "Not using PM2, check your server console output"
fi

echo ""
echo "🔍 Checking if finalUrl is being loaded..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test the API endpoint
if command -v curl &> /dev/null; then
    echo "Testing API endpoint..."
    echo "Note: You need to replace YOUR_TOKEN with actual JWT token"
else
    echo "curl not found. Install curl to test API endpoint"
fi

