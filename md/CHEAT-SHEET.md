# Monopoly Deployment Cheat Sheet

Quick reference for common tasks.

## 🎯 Initial Setup

### 1. Push to GitHub
```bash
cd C:\Users\ltm14\Desktop\Monopoly
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/monopoly-game.git
git push -u origin main
```

### 2. Deploy on Server
```bash
# SSH to server
ssh user@your-server-ip

# Clone repo
cd /opt
git clone https://github.com/YOUR_USERNAME/monopoly-game.git monopoly
cd monopoly

# Make update script executable
chmod +x update.sh

# Edit config
nano docker-compose.yml
# Change YOUR_SERVER_IP to your actual IP

# Deploy
docker-compose up -d --build
```

### 3. Configure Ports
Forward on router:
- Port 80 → your server
- Port 3001 → your server

---

## 🔄 Making Updates

### Local Development
```bash
# Make changes to code...

# Test locally
cd server && npm start
cd client && npm start

# Commit and push
git add .
git commit -m "Description of changes"
git push
```

### Update Production
```bash
# SSH to server
ssh user@your-server-ip

# Navigate to directory
cd /opt/monopoly

# Run update script
./update.sh
```

**Done!** The script handles everything automatically.

---

## 📊 Monitoring

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f
docker logs monopoly-server
docker logs monopoly-client
```

### Test Health
```bash
curl http://localhost:3001/health
```

### Container Stats
```bash
docker stats monopoly-server monopoly-client
```

---

## 🛠️ Common Tasks

### Restart Game
```bash
docker-compose restart
```

### Full Rebuild
```bash
docker-compose down
docker-compose up -d --build
```

### Stop Game
```bash
docker-compose down
```

### Start Game
```bash
docker-compose up -d
```

### View Active Games
```bash
curl http://localhost:3001/health | jq
```

---

## 🆘 Troubleshooting

### Container Won't Start
```bash
docker-compose logs monopoly-server
docker-compose down
docker-compose up -d --build
```

### Can't Connect from Internet
1. Check port forwarding (80, 3001)
2. Check firewall: `sudo ufw status`
3. Verify IP in docker-compose.yml

### Git Pull Fails
```bash
git stash
git pull
git stash pop
```

### Permission Denied
```bash
chmod +x update.sh
```

### Out of Disk Space
```bash
docker system prune -a
docker volume prune
```

---

## 🔐 Ports Reference

| Port | Service | Must Forward? |
|------|---------|---------------|
| 80 | Web Interface | ✅ Yes |
| 3001 | Game Server | ✅ Yes |
| 9000 | Webhook (optional) | Only if using webhooks |
| 443 | HTTPS (optional) | Only if using SSL |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Container configuration |
| `update.sh` | Update script |
| `.gitignore` | Files not to commit |
| `hooks.json` | Webhook config |

---

## 🔄 Rollback

```bash
cd /opt/monopoly
git log --oneline -5
git reset --hard <commit-hash>
./update.sh
```

---

## 📝 Git Commands

```bash
git status              # Check status
git add .               # Stage all changes
git commit -m "msg"     # Commit
git push                # Push to GitHub
git pull                # Pull from GitHub
git log --oneline -10   # View history
git diff                # See changes
```

---

## 🐳 Docker Commands

```bash
docker ps                           # List containers
docker logs <container>             # View logs
docker stats                        # Resource usage
docker-compose up -d                # Start
docker-compose down                 # Stop
docker-compose restart              # Restart
docker-compose ps                   # Status
docker-compose build --no-cache     # Rebuild
docker system prune -a              # Clean up
```

---

## 🌐 Access URLs

- **Local**: `http://localhost`
- **LAN**: `http://192.168.1.XXX`
- **Internet**: `http://YOUR_PUBLIC_IP`
- **Health Check**: `http://YOUR_IP:3001/health`

---

## ✅ Pre-Update Checklist

- [ ] Code tested locally
- [ ] Changes committed with good message
- [ ] Pushed to GitHub
- [ ] Players warned (if major change)
- [ ] Backup created (if major change)

---

## 🎮 Quick Test

After deployment/update:

```bash
# 1. Check containers running
docker-compose ps

# 2. Check health
curl http://localhost:3001/health

# 3. Open in browser
http://YOUR_SERVER_IP

# 4. Create test game
# Enter name, create game, verify it works
```

---

## 📞 Getting Help

1. Check logs: `docker-compose logs`
2. Check guides: `DEPLOYMENT.md`, `GITHUB-SETUP.md`
3. Check container status: `docker-compose ps`
4. Verify ports: `netstat -tlnp | grep -E '80|3001'`

---

**Print this and keep it handy! 📄**
