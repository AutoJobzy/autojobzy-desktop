#!/bin/bash
# AutoJobzy Mac Startup Script
# This script starts the server and then launches the app

echo "🚀 Starting AutoJobzy..."
echo ""

# Change to the correct directory
cd /Users/rohan/Downloads/Job_automate-main

# Kill any existing instances
echo "Stopping any running instances..."
killall AutoJobzy 2>/dev/null
pkill -f "node.*server/index.js" 2>/dev/null
sleep 2

# Start the backend server in background
echo "Starting backend server..."
node server/index.js > /tmp/autojobzy-server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to be ready
echo "Waiting for server to start..."
for i in {1..10}; do
    if lsof -i :5000 >/dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    sleep 1
    echo "  Waiting... ($i/10)"
done

# Check if server actually started
if ! lsof -i :5000 >/dev/null 2>&1; then
    echo "❌ Server failed to start. Check logs:"
    tail -20 /tmp/autojobzy-server.log
    exit 1
fi

# Launch the app
echo ""
echo "Launching AutoJobzy app..."
open /Applications/AutoJobzy.app

echo ""
echo "=========================================="
echo "✅ AutoJobzy is now running!"
echo "=========================================="
echo ""
echo "Server PID: $SERVER_PID"
echo "Server logs: /tmp/autojobzy-server.log"
echo ""
echo "To stop server: kill $SERVER_PID"
echo "Or to stop everything: killall AutoJobzy && pkill -f 'node.*server/index.js'"
echo ""
