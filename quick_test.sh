#!/bin/bash

echo "⚡ Quick URL Redirect Test"
echo "========================="
echo ""

# Test 1: Check if files were modified
echo "Test 1: File modifications..."
if grep -q "finalUrl: userFilters.finalUrl" server/autoFilter.js 2>/dev/null; then
    echo "✅ autoFilter.js - UPDATED"
else
    echo "❌ autoFilter.js - NEEDS UPDATE"
fi

if grep -q "rows\[0\]?.final_url" server/autoApply.js 2>/dev/null; then
    echo "✅ autoApply.js - UPDATED" 
else
    echo "❌ autoApply.js - NEEDS UPDATE"
fi

if grep -q "response.searchUrl" server/routes/jobSettings.js 2>/dev/null; then
    echo "✅ jobSettings.js - UPDATED"
else
    echo "❌ jobSettings.js - NEEDS UPDATE"
fi

echo ""
echo "Test 2: Database structure..."
if command -v mysql &> /dev/null; then
    mysql -u root -p -e "USE autojobzy_db; DESCRIBE user_filters;" 2>/dev/null | grep final_url
    if [ $? -eq 0 ]; then
        echo "✅ user_filters table has final_url column"
    fi
fi

echo ""
echo "All checks completed!"
echo ""
echo "To save a URL:"
echo "1. Open app → Login"
echo "2. Dashboard → Config tab"
echo "3. Scroll to 'Job Search Filters'"
echo "4. Paste URL in 'ENTER YOUR SEARCH URL' field"
echo "5. Click 'Save Configuration'"
echo "6. Check for green toast: 'Your data is saved successfully!'"

