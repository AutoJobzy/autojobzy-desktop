#!/bin/bash

echo "================================"
echo "Local Setup Status Check"
echo "================================"
echo ""

# Check .env file
if [ -f .env ]; then
    echo "✅ .env file exists"
    if grep -q "VITE_API_BASE_URL=https://api.autojobzy.com" .env; then
        echo "✅ API URL set to local (localhost:5000)"
    else
        echo "⚠️  API URL not set to local"
        echo "   Current setting: $(grep VITE_API_BASE_URL .env)"
    fi
else
    echo "❌ .env file missing"
fi

echo ""

# Check backend
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "✅ Backend running on port 5000"
else
    echo "❌ Backend NOT running on port 5000"
    echo "   Run: npm run server"
fi

echo ""

# Check frontend
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ Frontend running on port 3000"
else
    echo "❌ Frontend NOT running on port 3000"
    echo "   Run: npm run dev"
fi

echo ""

# Test backend API
echo "Testing backend API..."
if curl -s https://api.autojobzy.com/api/health > /dev/null 2>&1; then
    echo "✅ Backend API responding"
else
    echo "❌ Backend API not responding"
fi

echo ""
echo "================================"
echo "Summary"
echo "================================"

if [ -f .env ] && lsof -ti:5000 > /dev/null 2>&1 && lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ All systems ready for testing!"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:3000 in browser"
    echo "2. Login and trigger automation"
    echo "3. Watch the logs for new login messages"
else
    echo "⚠️  Some components need attention"
    echo "   Check the status above and fix any ❌ items"
fi

echo ""
