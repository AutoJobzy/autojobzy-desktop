#!/bin/bash

# Quick Local MySQL Setup Script
# Run this to set up local database instead of AWS RDS

echo "🗄️  Setting up local MySQL database..."

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL not found. Installing..."
    brew install mysql
    brew services start mysql
    echo "✅ MySQL installed and started"
else
    echo "✅ MySQL already installed"
fi

# Create database
echo "📦 Creating database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS jobautomate;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database 'jobautomate' created"
else
    echo "⚠️  Database creation failed. Trying with password..."
    echo "Please enter your MySQL root password (or press Enter if no password):"
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS jobautomate;"
fi

# Update .env file
echo "📝 Updating .env file for local database..."
cat > .env << 'EOF'
# Frontend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Local MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jobautomate
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_here_change_in_production

# Razorpay Configuration (Optional)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# AI API Keys (Optional)
GEMINI_API_KEY=
OPENAI_API_KEY=

# Naukri Credentials (Optional)
NAUKRI_EMAIL=
NAUKRI_PASSWORD=
EOF

echo "✅ .env file updated"

# Test connection
echo "🧪 Testing database connection..."
mysql -u root jobautomate -e "SELECT 1;" &> /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
    echo ""
    echo "🎉 Setup complete! Now run:"
    echo "   npm run server"
else
    echo "⚠️  Database connection test failed"
    echo "Please check MySQL is running: brew services list"
fi
