# GitHub Integration & Auto-Deployment Guide

This guide shows you how to use GitHub to manage your code and automatically update your server when you push changes.

## Option 1: Manual Updates (Easiest)

### Initial Setup

#### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (name it `monopoly-game` or similar)
3. Choose **Private** if you don't want others to see the code
4. **Don't** initialize with README (we already have one)
5. Click **Create repository**

#### 2. Push Your Code to GitHub

On your **local computer** (where you have the Monopoly folder):

```bash
cd C:\Users\ltm14\Desktop\Monopoly

# Initialize git (if not already done)
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - Complete Monopoly game"

# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR_USERNAME/monopoly-game.git

# Push to GitHub
git push -u origin main
```

If you get an error about `master` vs `main`:
```bash
git branch -M main
git push -u origin main
```

#### 3. Clone on Your Server

SSH into your server and run:

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/monopoly-game.git monopoly
cd monopoly

# Make update script executable
chmod +x update.sh

# Edit docker-compose.yml with your server IP
nano docker-compose.yml
# Change YOUR_SERVER_IP to your actual IP

# Deploy
docker-compose up -d --build
```

#### 4. Update When You Make Changes

**On your local computer:**
```bash
cd C:\Users\ltm14\Desktop\Monopoly

# Make your code changes...

# Commit and push
git add .
git commit -m "Description of changes"
git push
```

**On your server:**
```bash
cd /opt/monopoly
./update.sh
```

That's it! The `update.sh` script will:
- Pull latest code from GitHub
- Rebuild Docker containers
- Restart the game

---

## Option 2: Automatic Updates with Webhook (Intermediate)

This automatically updates your server whenever you push to GitHub.

### Setup

#### 1. Use Webhook Docker Compose

On your server:

```bash
cd /opt/monopoly

# Use the webhook-enabled compose file
cp docker-compose.webhook.yml docker-compose.yml

# Edit and add your server IP
nano docker-compose.yml

# Generate a webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "Your webhook secret: $WEBHOOK_SECRET"

# Edit hooks.json and replace YOUR_WEBHOOK_SECRET_HERE
nano hooks.json

# Make update script executable
chmod +x update.sh

# Start with webhook
docker-compose up -d --build
```

#### 2. Forward Port 9000

On your router, forward port **9000** to your server (in addition to 80 and 3001).

#### 3. Configure GitHub Webhook

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Fill in:
   - **Payload URL**: `http://YOUR_SERVER_IP:9000/hooks/monopoly-redeploy`
   - **Content type**: `application/json`
   - **Secret**: Paste your webhook secret from step 1
   - **Which events**: Select "Just the push event"
4. Click **Add webhook**

#### 4. Test It

On your local computer:
```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test webhook"
git push
```

Your server should automatically:
- Receive the webhook
- Pull latest code
- Rebuild containers
- Restart the game

Check logs:
```bash
docker logs monopoly-webhook
```

---

## Option 3: GitHub Actions (Advanced)

Fully automated CI/CD pipeline.

### Setup

#### 1. Create GitHub Action Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Deploy via SSH
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /opt/monopoly
          ./update.sh
```

#### 2. Add GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:
   - `SERVER_HOST`: Your server's IP address
   - `SERVER_USER`: Your SSH username (usually `root` or your username)
   - `SSH_PRIVATE_KEY`: Your SSH private key

To get your SSH private key:
```bash
cat ~/.ssh/id_rsa
```

#### 3. Push and Auto-Deploy

Now whenever you push to `main` branch, GitHub Actions will automatically:
- Connect to your server via SSH
- Run the update script
- Rebuild and restart

---

## Workflow Comparison

| Method | Setup Difficulty | Update Process | Cost |
|--------|-----------------|----------------|------|
| **Manual** | Easy | Run script on server | Free |
| **Webhook** | Medium | Automatic on push | Free |
| **GitHub Actions** | Hard | Automatic on push | Free (2000 min/month) |

### Recommendations

- **Development**: Use Manual (simple and reliable)
- **Small team**: Use Webhook (automatic but you control the server)
- **Production/Team**: Use GitHub Actions (professional CI/CD)

---

## Common Workflows

### Making Updates to the Game

```bash
# On your local computer
cd C:\Users\ltm14\Desktop\Monopoly

# Make changes to code...

# Test locally first
cd server
npm start

# If it works, commit and push
git add .
git commit -m "Fixed bug in rent calculation"
git push
```

**Then:**
- **Manual**: SSH to server, run `./update.sh`
- **Webhook**: Automatic within 30 seconds
- **GitHub Actions**: Automatic within 1-2 minutes

### Rolling Back Changes

If an update breaks something:

```bash
# On your server
cd /opt/monopoly

# See commit history
git log --oneline

# Roll back to previous version
git reset --hard <commit-hash>

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Creating Feature Branches

```bash
# Create a new branch for a feature
git checkout -b feature/new-card-types

# Make changes...

# Push to GitHub
git push -u origin feature/new-card-types

# When ready, merge on GitHub via Pull Request
```

---

## Update Script Details

The `update.sh` script does this:

1. ✅ Pulls latest code from GitHub
2. ✅ Stops running containers
3. ✅ Rebuilds with `--no-cache` (ensures fresh build)
4. ✅ Starts containers
5. ✅ Cleans up old Docker images
6. ✅ Shows container status

### Customizing the Update Script

Edit `update.sh` to add custom steps:

```bash
# Add before starting containers
echo "Running database migrations..."
# your migration commands here

# Add after starting containers
echo "Running smoke tests..."
curl http://localhost:3001/health
```

---

## Troubleshooting

### Permission Denied

```bash
chmod +x update.sh
```

### Git Pull Fails

```bash
# Stash local changes
git stash

# Pull
git pull

# Reapply changes
git stash pop
```

### Webhook Not Triggering

1. Check GitHub webhook recent deliveries
2. Verify secret matches in `hooks.json`
3. Check webhook logs: `docker logs monopoly-webhook`
4. Ensure port 9000 is forwarded

### Build Fails After Update

```bash
# Check logs
docker-compose logs

# Try manual rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Security Best Practices

### 1. Use Private Repository

Keep your repo private if it contains:
- Server IPs
- Custom configurations
- Sensitive data

### 2. Use Environment Variables

Don't commit sensitive data. Use `.env` files:

```bash
# On server, create .env
echo "SERVER_IP=203.0.113.45" > .env

# In docker-compose.yml, use:
environment:
  - SERVER_IP=${SERVER_IP}
```

Add `.env` to `.gitignore` (already done).

### 3. Webhook Security

- Use strong webhook secret (32+ characters)
- Don't expose webhook port publicly if possible
- Use HTTPS for webhooks (requires SSL)

### 4. SSH Keys for GitHub Actions

- Never commit SSH keys
- Use GitHub Secrets for sensitive data
- Rotate keys periodically

---

## Quick Reference

### Git Commands

```bash
# Check status
git status

# See changes
git diff

# Commit all changes
git add .
git commit -m "Your message"

# Push to GitHub
git push

# Pull from GitHub
git pull

# Create branch
git checkout -b branch-name

# Switch branch
git checkout branch-name

# Merge branch
git merge branch-name
```

### Server Commands

```bash
# Update game
./update.sh

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Stop containers
docker-compose down

# Start containers
docker-compose up -d

# Check status
docker-compose ps
```

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Clone on server
3. ✅ Choose update method (Manual recommended to start)
4. ✅ Test update workflow
5. ✅ Set up automated backups (optional)

**You're all set!** Now you can develop locally, push to GitHub, and easily update your production server.
