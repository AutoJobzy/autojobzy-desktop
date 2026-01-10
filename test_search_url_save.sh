#!/bin/bash

echo "========================================="
echo "Search URL Save Functionality Test"
echo "========================================="
echo ""

# Step 1: Verify database table structure
echo "Step 1: Verifying user_filters table structure..."
echo "Running: node server/db/verifyUserFiltersTable.js"
echo ""
node server/db/verifyUserFiltersTable.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Database verification failed!"
    exit 1
fi

echo ""
echo "========================================="
echo "Step 2: Testing API endpoint..."
echo "========================================="
echo ""

# Get token from user
echo "Please provide a valid user token:"
echo "(You can find it in localStorage.getItem('token') from browser console)"
read -r TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

# Test saving a search URL
echo ""
echo "Testing POST /api/filters/user with Search URL..."
echo ""

RESPONSE=$(curl -s -X POST https://api.autojobzy.com/api/filters/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "finalUrl": "https://www.naukri.com/software-engineer-jobs?test=123",
    "freshness": "1",
    "salaryRange": "5-10 Lakhs",
    "wfhType": "Work from Home"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'

# Check if successful
if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo ""
    echo "✅ Save request successful!"
else
    echo ""
    echo "❌ Save request failed!"
    exit 1
fi

# Verify by fetching back
echo ""
echo "========================================="
echo "Step 3: Verifying saved data..."
echo "========================================="
echo ""

FETCH_RESPONSE=$(curl -s -X GET https://api.autojobzy.com/api/filters/user \
  -H "Authorization: Bearer $TOKEN")

echo "Fetched data:"
echo "$FETCH_RESPONSE" | jq '.'

# Check if finalUrl was saved
FINAL_URL=$(echo "$FETCH_RESPONSE" | jq -r '.data.finalUrl')

if [ "$FINAL_URL" != "null" ] && [ -n "$FINAL_URL" ]; then
    echo ""
    echo "✅ SUCCESS! Search URL was saved correctly:"
    echo "   $FINAL_URL"
else
    echo ""
    echo "❌ FAILED! Search URL was not saved."
    echo "   Expected: https://www.naukri.com/software-engineer-jobs?test=123"
    echo "   Got: $FINAL_URL"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ All tests passed!"
echo "========================================="
