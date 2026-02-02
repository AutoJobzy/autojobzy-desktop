#!/bin/bash

###############################################################################
# AutoJobzy Nginx Configuration Deployment Script
# Run this on your production server to update nginx configuration
###############################################################################

echo "========================================"
echo "AutoJobzy Nginx Configuration Update"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root or with sudo"
    echo "Usage: sudo bash deploy-nginx-config.sh"
    exit 1
fi

# Backup existing configuration
echo "📦 Backing up existing nginx configuration..."
BACKUP_DIR="/etc/nginx/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -f /etc/nginx/sites-available/autojobzy ]; then
    cp /etc/nginx/sites-available/autojobzy "$BACKUP_DIR/autojobzy_$TIMESTAMP.conf"
    echo "✅ Backup created: $BACKUP_DIR/autojobzy_$TIMESTAMP.conf"
else
    echo "⚠️  No existing config found, creating new one"
fi

# Create/Update nginx configuration
echo ""
echo "📝 Creating nginx configuration..."
cat > /etc/nginx/sites-available/autojobzy << 'EOF'
# AutoJobzy API Nginx Configuration

server {
    listen 80;
    server_name api.autojobzy.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.autojobzy.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.autojobzy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.autojobzy.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Increase client body size for resume uploads
    client_max_body_size 10M;

    # Special handling for Naukri verification (needs longer timeout)
    location /api/auth/verify-naukri-credentials {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CRITICAL: Extended timeouts for Puppeteer (120 seconds)
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;

        # Disable buffering for real-time response
        proxy_buffering off;
    }

    # All other API endpoints (normal timeout)
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Standard timeouts (60 seconds)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        access_log off;
    }

    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

echo "✅ Configuration file created"

# Enable site (create symlink if doesn't exist)
if [ ! -L /etc/nginx/sites-enabled/autojobzy ]; then
    echo ""
    echo "🔗 Enabling site..."
    ln -s /etc/nginx/sites-available/autojobzy /etc/nginx/sites-enabled/
    echo "✅ Site enabled"
fi

# Test nginx configuration
echo ""
echo "🧪 Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration test passed"

    # Reload nginx
    echo ""
    echo "🔄 Reloading nginx..."
    systemctl reload nginx

    if [ $? -eq 0 ]; then
        echo "✅ Nginx reloaded successfully"
        echo ""
        echo "========================================"
        echo "✅ Deployment Complete!"
        echo "========================================"
        echo ""
        echo "The following changes were made:"
        echo "- Naukri verification timeout: 120 seconds (was 60s)"
        echo "- Other API timeouts: 60 seconds"
        echo "- Max upload size: 10MB"
        echo ""
        echo "You can now test the verification endpoint:"
        echo "curl -X POST https://api.autojobzy.com/api/auth/verify-naukri-credentials \\"
        echo "  -H 'Authorization: Bearer YOUR_TOKEN' \\"
        echo "  -H 'Content-Type: application/json' \\"
        echo "  -d '{\"naukriUsername\":\"email\",\"naukriPassword\":\"pass\"}'"
        echo ""
    else
        echo "❌ Failed to reload nginx"
        echo "Check logs: sudo journalctl -u nginx -n 50"
        exit 1
    fi
else
    echo "❌ Configuration test failed"
    echo "Restoring backup..."
    if [ -f "$BACKUP_DIR/autojobzy_$TIMESTAMP.conf" ]; then
        cp "$BACKUP_DIR/autojobzy_$TIMESTAMP.conf" /etc/nginx/sites-available/autojobzy
        echo "✅ Backup restored"
    fi
    exit 1
fi
