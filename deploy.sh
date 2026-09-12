#!/bin/bash
# =====================================================================
# CodeFlow 1-Click Automated Production Deployment Script for Ubuntu
# =====================================================================
set -e

echo "🚀 Starting CodeFlow Automated Production Deployment..."

# 1. Update Ubuntu packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    sudo apt install -y docker.io
    sudo systemctl enable --now docker
    sudo usermod -aG docker $USER
fi

# 3. Install Node.js 20 & NGINX & PM2 & Certbot
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs nginx certbot python3-certbot-nginx
    sudo npm install -g pm2
fi

# 4. Start Redis in Docker (for BullMQ queue & Socket.io adapter)
echo "⚡ Starting Redis container..."
if ! docker ps -a | grep -q "codeflow-redis"; then
    docker run -d --name codeflow-redis --restart always -p 6379:6379 redis:alpine
else
    docker start codeflow-redis || true
fi

# 5. Build Docker execution sandbox images
echo "🐳 Building Docker execution sandboxes..."
cd "$(dirname "$0")/backend"
if [ -f "scripts/build-images.sh" ]; then
    chmod +x scripts/build-images.sh
    ./scripts/build-images.sh || true
fi

# 6. Install Backend Dependencies & Start PM2 Cluster
echo "🔧 Setting up Backend..."
npm install --production=false
pm2 start ecosystem.config.js --env production
pm2 save

# 7. Install Frontend Dependencies & Build Production Assets
echo "🎨 Building Frontend..."
cd ../frontend
npm install
npm run build

# 8. Copy Frontend Build to Web Root
echo "📁 Deploying Frontend static assets to /var/www/codeflow/frontend/dist..."
sudo mkdir -p /var/www/codeflow/frontend/dist
sudo cp -r dist/* /var/www/codeflow/frontend/dist/

# 9. Configure NGINX
echo "🌐 Configuring NGINX..."
cd ..
sudo cp nginx.conf /etc/nginx/sites-available/codeflow
sudo ln -sf /etc/nginx/sites-available/codeflow /etc/nginx/sites-enabled/codeflow
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "====================================================================="
echo "✅ CodeFlow Deployment Complete!"
echo "📍 Access your application at your server's IP address."
echo "🔒 To add free SSL, run: sudo certbot --nginx -d yourdomain.com"
echo "====================================================================="
