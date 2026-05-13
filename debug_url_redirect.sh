#!/bin/bash

echo "🔧 AutoJobzy URL Redirect Debugger"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Database
echo "📊 Step 1: Checking Database..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v mysql &> /dev/null; then
    echo "Enter your MySQL root password when prompted:"
    mysql -u root -p -e "USE autojobzy_db; SELECT COUNT(*) as total_users FROM users;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database connection successful${NC}"
        
        echo ""
        echo "Checking saved URLs:"
        mysql -u root -p -e "USE autojobzy_db; SELECT user_id, LEFT(final_url, 80) as url_preview, updated_at FROM user_filters WHERE final_url IS NOT NULL AND final_url != '' ORDER BY updated_at DESC LIMIT 3;" 2>/dev/null
    else
        echo -e "${RED}✗ Database connection failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ MySQL client not found${NC}"
fi

echo ""
echo "📁 Step 2: Checking Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if autoApply.js exists and has the URL fetching code
if grep -q "fetchFinalUrlFromDB" server/autoApply.js 2>/dev/null; then
    echo -e "${GREEN}✓ autoApply.js has URL fetching code${NC}"
else
    echo -e "${RED}✗ autoApply.js missing URL fetching code${NC}"
fi

# Check if autoFilter.js has the URL code
if grep -q "finalUrl" server/autoFilter.js 2>/dev/null; then
    echo -e "${GREEN}✓ autoFilter.js has finalUrl support${NC}"
else
    echo -e "${RED}✗ autoFilter.js missing finalUrl support${NC}"
fi

# Check if jobSettings.js returns searchUrl
if grep -q "searchUrl.*finalUrl" server/routes/jobSettings.js 2>/dev/null; then
    echo -e "${GREEN}✓ jobSettings.js returns searchUrl${NC}"
else
    echo -e "${RED}✗ jobSettings.js missing searchUrl field${NC}"
fi

echo ""
echo "🌐 Step 3: Testing API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v curl &> /dev/null; then
    echo "To test the API, run this command with your JWT token:"
    echo ""
    echo "curl 'https://api.autojobzy.com/api/job-settings' \\"
    echo "  -H 'Authorization: Bearer YOUR_TOKEN_HERE'"
    echo ""
    echo "Look for 'searchUrl' in the response"
else
    echo -e "${YELLOW}⚠ curl not found${NC}"
fi

echo ""
echo "💡 Common Issues & Fixes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. URL not saved → Go to Dashboard → Config → Enter URL → Save"
echo "2. URL is empty string → Check if form field is filled before saving"
echo "3. Default URL used → finalUrl is NULL or empty in database"
echo "4. Server not restarted → Restart: cd server && npm start"
echo ""
echo "✅ Debug script completed"
echo ""
echo "Next Steps:"
echo "1. Check database for saved URL (Step 1)"
echo "2. Test API endpoint with your token (Step 3)"
echo "3. Start automation and watch console logs"

