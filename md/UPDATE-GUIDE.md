# Quick Update Guide

## 🚀 How to Update Your Live Server

### Method 1: Manual Update (Recommended)

**After pushing changes to GitHub:**

```bash
# SSH into your server
ssh user@your-server-ip

# Navigate to game directory
cd /opt/monopoly

# Run update script
./update.sh
```

**That's it!** The script automatically:
1. Pulls latest code from GitHub
2. Rebuilds Docker containers
3. Restarts the game
4. Cleans up old images

---

### Method 2: Automatic Updates

Set up webhooks so your server auto-updates when you push to GitHub.

See [GITHUB-SETUP.md](GITHUB-SETUP.md) for full instructions.

---

## 📝 Development Workflow

### Making Changes

**1. On your local computer:**

```bash
cd C:\Users\ltm14\Desktop\Monopoly

# Make your code changes...
# Edit files, test locally, etc.

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Added speed die animation"

# Push to GitHub
git push
```

**2. Update your server:**

**Option A - Manual:**
```bash
ssh user@your-server
cd /opt/monopoly
./update.sh
```

**Option B - Automatic:**
- Just wait 30 seconds, webhook does it automatically

**Option C - GitHub Actions:**
- Automatic deployment happens when you push

---

## 🧪 Testing Before Deployment

**Always test locally first:**

```bash
# Test server
cd server
npm start

# In another terminal, test client
cd client
npm start
```

Visit `http://localhost:3000` and verify everything works.

---

## ⚠️ Rolling Back

If an update breaks something:

```bash
# On your server
cd /opt/monopoly

# See recent commits
git log --oneline -10

# Roll back to previous version
git reset --hard <previous-commit-hash>

# Rebuild
docker-compose down
docker-compose up -d --build
```

---

## 📊 Checking Status

### View container logs
```bash
docker-compose logs -f
```

### Check if containers are running
```bash
docker-compose ps
```

### Test health endpoint
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","games":X}`

---

## 🔍 Common Issues

### Update script permission denied
```bash
chmod +x update.sh
```

### Git pull fails
```bash
git stash           # Save local changes
git pull            # Pull from GitHub
git stash pop       # Reapply local changes
```

### Containers won't start
```bash
# Check logs
docker-compose logs

# Try full rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Players getting disconnected during update
Updates cause a brief disconnection (30-60 seconds). Warn players before updating:
```bash
# Option: Schedule maintenance window
# Update during low-traffic times
```

---

## 🎯 Best Practices

### 1. Test Locally First
Always test changes on your local machine before pushing.

### 2. Use Descriptive Commit Messages
```bash
# Good
git commit -m "Fixed rent calculation for railroads"

# Bad
git commit -m "fix"
```

### 3. Update During Low Traffic
Schedule updates when few players are online.

### 4. Backup Before Major Changes
```bash
# On server, create backup
cd /opt
tar -czf monopoly-backup-$(date +%Y%m%d).tar.gz monopoly/
```

### 5. Monitor After Updates
Watch logs for errors:
```bash
docker-compose logs -f
```

---

## 📅 Update Checklist

Before updating production:

- [ ] Changes tested locally
- [ ] Code committed to GitHub
- [ ] Git commit message is descriptive
- [ ] Players notified if major changes
- [ ] Backup created (for major updates)
- [ ] Ready to monitor logs after update

After updating:

- [ ] Containers started successfully
- [ ] Health check passes
- [ ] Test game creation/joining
- [ ] No errors in logs
- [ ] Players can connect

---

## 🆘 Emergency Rollback

If something goes very wrong:

```bash
# Quick rollback to last working version
cd /opt/monopoly
git log --oneline -5
git reset --hard <last-working-commit>
./update.sh

# Or restore from backup
cd /opt
rm -rf monopoly
tar -xzf monopoly-backup-YYYYMMDD.tar.gz
cd monopoly
docker-compose up -d
```

---

## 📚 More Info

- **Initial GitHub Setup**: [GITHUB-SETUP.md](GITHUB-SETUP.md)
- **Production Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Development Setup**: [README.md](README.md)

---

## Quick Command Reference

```bash
# Local development
git add .
git commit -m "message"
git push

# Server update (manual)
ssh user@server
cd /opt/monopoly
./update.sh

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Full rebuild
docker-compose down
docker-compose up -d --build
```

---

**Happy coding! 🎲**
