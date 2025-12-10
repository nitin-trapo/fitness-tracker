# Fitness Tracker - DigitalOcean Deployment Guide

## Prerequisites
- DigitalOcean account
- SSH key added to your DigitalOcean account
- Git installed locally

---

## Step 1: Create a DigitalOcean Droplet

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. Click **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/mo is sufficient for small apps)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH Key (recommended)
4. Click **Create Droplet**
5. Note your Droplet's **IP address**

---

## Step 2: Connect to Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

### Create a deploy user (recommended)
```bash
# Create user
adduser deploy

# Add to sudo group
usermod -aG sudo deploy

# Copy SSH keys to new user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Switch to deploy user
su - deploy
```

---

## Step 3: Run the Setup Script

Upload and run the setup script on your droplet:

```bash
# On your droplet (as deploy user)
curl -o setup-server.sh https://raw.githubusercontent.com/YOUR_REPO/main/deploy/setup-server.sh
# OR copy the content manually

bash setup-server.sh
```

This script will:
- Install Node.js 20.x, PM2, Nginx
- Create application directories
- Set up a bare Git repository with auto-deploy hook
- Configure Nginx as reverse proxy
- Set up firewall rules

---

## Step 4: Configure Git Remote (Local Machine)

On your **local machine**, add the production remote:

```bash
cd /path/to/fitness-tracker

# Add production remote
git remote add production ssh://deploy@YOUR_DROPLET_IP/var/repo/fitness-tracker.git

# Verify remotes
git remote -v
```

---

## Step 5: Deploy

```bash
# Commit your changes
git add .
git commit -m "Initial deployment"

# Push to deploy
git push production main
```

The post-receive hook will automatically:
1. Checkout the code
2. Install dependencies
3. Build the client
4. Restart the server with PM2

---

## Step 6: Verify Deployment

Visit `http://YOUR_DROPLET_IP` in your browser.

---

## Common Commands

### On the Droplet

```bash
# View application logs
pm2 logs fitness-tracker

# Restart application
pm2 restart fitness-tracker

# View application status
pm2 status

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### On Local Machine

```bash
# Deploy new changes
git add .
git commit -m "Your changes"
git push production main
```

---

## Setting Up a Domain (Optional)

1. Point your domain's A record to your Droplet IP
2. Edit Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/fitness-tracker
   ```
3. Replace `server_name _;` with `server_name yourdomain.com www.yourdomain.com;`
4. Reload Nginx: `sudo systemctl reload nginx`

### Add SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Troubleshooting

### Build fails for better-sqlite3
```bash
cd /var/www/fitness-tracker/server
npm rebuild better-sqlite3
```

### Permission denied
```bash
sudo chown -R deploy:deploy /var/www/fitness-tracker
sudo chown -R deploy:deploy /var/repo
```

### Port already in use
```bash
pm2 delete fitness-tracker
pm2 start server/index.js --name fitness-tracker
```

### Check if server is running
```bash
pm2 status
curl http://localhost:5000/api/health
```
