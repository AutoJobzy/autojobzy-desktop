#!/bin/bash
# 🚀 QUICK START SCRIPT
# This script helps set up MySQL and run the Job Automation Bot

set -e

echo "╔════════════════════════════════════════════╗"
echo "║  🤖 Job Automation Bot - Setup              ║"
echo "║  Complete Backend System with MySQL         ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if MySQL is installed
echo "📋 Checking MySQL installation..."
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed."
    echo ""
    echo "Install MySQL using:"
    echo "  macOS:   brew install mysql"
    echo "  Windows: choco install mysql"
    echo "  Linux:   sudo apt-get install mysql-server"
    echo ""
    exit 1
else
    echo "✅ MySQL is installed"
fi

# Check if MySQL is running
echo "📋 Checking MySQL service..."
if ! mysql -u root -p2>/dev/null >/dev/null 2>&1; then
    echo "⚠️  Starting MySQL service..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mysql 2>/dev/null || true
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start mysql 2>/dev/null || true
    fi
    sleep 2
fi

# Create database and user
echo "📊 Setting up database..."
mysql -u root -proot << EOF 2>/dev/null || echo "⚠️  Note: If you get 'Access denied', MySQL password may be different. Update .env accordingly."
CREATE DATABASE IF NOT EXISTS jobautomate;
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON jobautomate.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ Database setup complete"
echo ""

# Install dependencies
echo "📦 Installing Node dependencies..."
cd "$(dirname "$0")"
npm install --silent
echo "✅ Dependencies installed"
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp server/.env.template .env 2>/dev/null || echo "# .env file - add your OpenAI API key" > .env
fi

echo "╔════════════════════════════════════════════╗"
echo "║  🎉 Setup Complete!                        ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "📝 Next steps:"
echo "  1. Edit .env and add your OpenAI API key"
echo "  2. Start backend:  npm run server"
echo "  3. Start frontend: npm run dev"
echo "  4. Go to http://localhost:5173"
echo "  5. Sign up → Save profile → Upload resume → Start Bot"
echo ""
echo "🌐 Access Points:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   https://api.autojobzy.com"
echo "  MySQL:     localhost:3306 (root/root)"
echo ""
