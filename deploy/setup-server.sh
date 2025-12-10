#!/bin/bash
# Run this script on your DigitalOcean Droplet to set up the deployment environment
# Usage: bash setup-server.sh

set -e

APP_NAME="fitness-tracker"
APP_DIR="/var/www/$APP_NAME"
REPO_DIR="/var/repo/$APP_NAME.git"

echo "=== Setting up $APP_NAME deployment ==="

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install build essentials (required for better-sqlite3)
echo "Installing build tools..."
sudo apt install -y build-essential python3

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Create application directory
echo "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Create bare Git repository
echo "Creating bare Git repository..."
sudo mkdir -p $REPO_DIR
sudo chown -R $USER:$USER /var/repo
cd $REPO_DIR
git init --bare

# Create post-receive hook
echo "Creating post-receive hook..."
cat > $REPO_DIR/hooks/post-receive << 'EOF'
#!/bin/bash
APP_NAME="fitness-tracker"
APP_DIR="/var/www/$APP_NAME"
REPO_DIR="/var/repo/$APP_NAME.git"

echo "=== Deploying $APP_NAME ==="

# Checkout the latest code
git --work-tree=$APP_DIR --git-dir=$REPO_DIR checkout -f main

cd $APP_DIR

# Install server dependencies and rebuild native modules
echo "Installing server dependencies..."
cd server
npm install
npm rebuild better-sqlite3

# Initialize database if not exists
if [ ! -f "fitness.db" ]; then
    echo "Initializing database..."
    npm run db:init
    npm run db:seed
fi

cd ..

# Build client
echo "Building client..."
cd client
npm install
npm run build
cd ..

# Restart application with PM2
echo "Restarting application..."
pm2 restart $APP_NAME || pm2 start server/index.js --name $APP_NAME

echo "=== Deployment complete ==="
EOF

chmod +x $REPO_DIR/hooks/post-receive

# Create Nginx configuration
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain or droplet IP

    # Serve static files from client build
    location / {
        root /var/www/fitness-tracker/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js server
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# Set up PM2 to start on boot
pm2 startup systemd -u $USER --hp /home/$USER
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. On your LOCAL machine, add the remote:"
echo "   git remote add production ssh://$USER@YOUR_DROPLET_IP$REPO_DIR"
echo ""
echo "2. Push to deploy:"
echo "   git push production main"
echo ""
echo "3. (Optional) Set up your domain in /etc/nginx/sites-available/$APP_NAME"
echo ""
