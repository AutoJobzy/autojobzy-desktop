#!/bin/bash

# Test Suggestions API
echo "Testing Suggestions API..."
echo ""

# Your auth token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMTcwYjBhZi1jNWEwLTQ1MjAtOTk0OS1lMWU2MWIzMTJjZTEiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2NjYxOTkzNiwiZXhwIjoxNzY5MjExOTM2fQ.iAh5RRy2WpyhDo5_Nf0dOItBeMdkcxEDjH5MFlp87L8"

# Test 1: Create a suggestion
echo "1. Creating a new suggestion..."
curl -s -X POST https://api.autojobzy.com/api/suggestions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "feature_request",
    "title": "Add dark mode toggle",
    "description": "It would be great to have a dark mode toggle in the settings. This will help reduce eye strain during night time usage."
  }' | jq .

echo ""
echo ""

# Test 2: Get user stats
echo "2. Getting user statistics..."
curl -s -X GET https://api.autojobzy.com/api/suggestions/stats/summary \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo ""

# Test 3: Get all user suggestions
echo "3. Getting all user suggestions..."
curl -s -X GET https://api.autojobzy.com/api/suggestions \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "Testing complete!"
