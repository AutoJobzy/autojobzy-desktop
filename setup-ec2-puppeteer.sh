#!/bin/bash

###############################################################################
# Puppeteer EC2 Setup Script
# This script installs all dependencies required to run Puppeteer on Linux EC2
###############################################################################

echo "=========================================="
echo "Puppeteer EC2 Setup Script"
echo "=========================================="

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Cannot detect OS. Exiting."
    exit 1
fi

echo "Detected OS: $OS"
echo ""

# Ubuntu/Debian
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    echo "Installing dependencies for Ubuntu/Debian..."

    sudo apt-get update

    sudo apt-get install -y \
      ca-certificates \
      fonts-liberation \
      libappindicator3-1 \
      libasound2 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libc6 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgbm1 \
      libgcc1 \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libstdc++6 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxcursor1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxi6 \
      libxrandr2 \
      libxrender1 \
      libxss1 \
      libxtst6 \
      lsb-release \
      wget \
      xdg-utils

    # Optional: Install Google Chrome Stable (recommended for production)
    echo ""
    echo "Do you want to install Google Chrome Stable? (recommended) [y/N]"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
        sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
        sudo apt-get update
        sudo apt-get install -y google-chrome-stable
        echo "Google Chrome Stable installed successfully!"
    fi

# Amazon Linux
elif [ "$OS" = "amzn" ]; then
    echo "Installing dependencies for Amazon Linux..."

    sudo yum update -y

    sudo yum install -y \
      alsa-lib \
      atk \
      cups-libs \
      gtk3 \
      ipa-gothic-fonts \
      libXcomposite \
      libXcursor \
      libXdamage \
      libXext \
      libXi \
      libXrandr \
      libXScrnSaver \
      libXtst \
      pango \
      xorg-x11-fonts-100dpi \
      xorg-x11-fonts-75dpi \
      xorg-x11-fonts-cyrillic \
      xorg-x11-fonts-misc \
      xorg-x11-fonts-Type1 \
      xorg-x11-utils

    # Optional: Install Google Chrome
    echo ""
    echo "Do you want to install Google Chrome Stable? (recommended) [y/N]"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
        sudo yum install -y ./google-chrome-stable_current_x86_64.rpm
        rm -f google-chrome-stable_current_x86_64.rpm
        echo "Google Chrome Stable installed successfully!"
    fi

# RHEL/CentOS
elif [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    echo "Installing dependencies for RHEL/CentOS..."

    sudo yum update -y

    sudo yum install -y \
      alsa-lib \
      atk \
      cups-libs \
      gtk3 \
      libXcomposite \
      libXcursor \
      libXdamage \
      libXext \
      libXi \
      libXrandr \
      libXScrnSaver \
      libXtst \
      pango \
      xorg-x11-fonts-100dpi \
      xorg-x11-fonts-75dpi \
      xorg-x11-fonts-cyrillic \
      xorg-x11-fonts-misc \
      xorg-x11-fonts-Type1

else
    echo "Unsupported OS: $OS"
    echo "Please install Chromium dependencies manually."
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Make sure Node.js is installed (v18+ recommended)"
echo "2. Run: npm install"
echo "3. Start your server: npm run server"
echo ""
echo "If you encounter issues, check:"
echo "- Browser launch logs for missing library errors"
echo "- System Chrome installation: google-chrome --version"
echo "- Puppeteer bundled Chromium: node -e \"console.log(require('puppeteer').executablePath())\""
echo ""
