# Quick Start - Production Deployment

## TL;DR - Get Running in 5 Minutes

### 1. Upload to Server

Upload the entire `Monopoly` folder to your server at `/opt/monopoly` (or any location you prefer).

### 2. Edit Configuration

Edit `docker-compose.yml` and change this line:

```yaml
- REACT_APP_SERVER_URL=http://YOUR_SERVER_IP:3005
```

Replace `YOUR_SERVER_IP` with:
- Your server's **public IP** (e.g., `203.0.113.45`), or
- Your **domain name** (e.g., `game.example.com`)

Example:
```yaml
- REACT_APP_SERVER_URL=http://203.0.113.45:3005
```

### 3. Deploy in Portainer

1. Open Portainer web interface
2. **Stacks** → **Add Stack**
3. Name: `monopoly`
4. **Upload** → Select `docker-compose.yml`
5. Click **Deploy the stack**

Wait 2-3 minutes for build to complete.

### 4. Configure Port Forwarding

On your router, forward these ports to your server's local IP:

| Port | Service |
|------|---------|
| 80 | Web Interface |
| 3005 | Game Server |

### 5. Play!

Players access the game at:
- `http://YOUR_PUBLIC_IP` (example: `http://203.0.113.45`)

---

## Port Forwarding Details

### What Ports to Forward?

**Required:**
- **Port 80** (TCP) → Your server
- **Port 3005** (TCP) → Your server

**Optional:**
- **Port 443** (TCP) → For future SSL/HTTPS

### How to Port Forward?

Every router is different, but generally:

1. Log into your router admin panel (usually `192.168.1.1` or `192.168.0.1`)
2. Find "Port Forwarding" section (might be under Advanced, NAT, or Firewall)
3. Add two rules:

**Rule 1:**
- Service Name: `Monopoly-Web`
- External Port: `80`
- Internal IP: `Your server's local IP` (e.g., `192.168.1.100`)
- Internal Port: `80`
- Protocol: `TCP`

**Rule 2:**
- Service Name: `Monopoly-Game`
- External Port: `3005`
- Internal IP: `Your server's local IP` (e.g., `192.168.1.100`)
- Internal Port: `3005`
- Protocol: `TCP`

### Find Your Server's Local IP

On your server, run:
```bash
ip addr show | grep inet
```

Look for an address like `192.168.1.xxx` or `10.0.0.xxx`

### Find Your Public IP

On your server, run:
```bash
curl ifconfig.me
```

This is what players will use to access the game.

---

## Verify It's Working

### 1. Check Containers

In Portainer, both containers should show **running** status:
- `monopoly-server`
- `monopoly-client`

### 2. Test Locally on Server

```bash
curl http://localhost:3005/health
```

Should return: `{"status":"ok","games":0}`

### 3. Test from Another Computer

On any computer on your local network, open browser to:
- `http://YOUR_SERVER_LOCAL_IP`

Example: `http://192.168.1.100`

### 4. Test from Internet

On a phone (using cellular data, not WiFi), open browser to:
- `http://YOUR_PUBLIC_IP`

Example: `http://203.0.113.45`

---

## Troubleshooting

### Can't access from local network

**Problem:** Server containers are not running
**Solution:**
```bash
docker ps | grep monopoly
```
Both containers should be listed. If not:
```bash
cd /opt/monopoly
docker-compose up -d --build
```

### Can't access from internet

**Problem:** Port forwarding not configured
**Solution:** Double-check port forwarding rules on your router

**Problem:** Firewall blocking ports
**Solution:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 3005/tcp
sudo ufw reload
```

### WebSocket errors in browser console

**Problem:** Wrong server URL in docker-compose.yml
**Solution:** Make sure `REACT_APP_SERVER_URL` uses your public IP or domain, not `localhost`

### "Connection refused" errors

**Problem:** Server container isn't running
**Solution:**
```bash
docker logs monopoly-server
```
Check logs for errors

---

## Common Scenarios

### Scenario 1: Using a Domain Name

If you have `game.example.com` pointing to your server:

1. Edit `docker-compose.yml`:
   ```yaml
   - REACT_APP_SERVER_URL=http://game.example.com:3005
   ```

2. Rebuild:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

3. Players access at: `http://game.example.com`

### Scenario 2: Behind CGNAT (Can't Port Forward)

If your ISP uses CGNAT and you can't port forward:

**Option A:** Use Cloudflare Tunnel (free)
**Option B:** Use ngrok (free tier available)
**Option C:** Use a VPS with a public IP

### Scenario 3: Dynamic IP Address

If your public IP changes frequently:

**Option A:** Use a Dynamic DNS service (DuckDNS, No-IP, etc.)
**Option B:** Check IP regularly and update docker-compose.yml
**Option C:** Get a static IP from your ISP

---

## Quick Commands Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker logs monopoly-server
docker logs monopoly-client

# Rebuild after changes
docker-compose down
docker-compose up -d --build

# Check status
docker ps | grep monopoly

# Test health
curl http://localhost:3005/health
```

---

## File Locations on Server

```
/opt/monopoly/
├── docker-compose.yml          # Main configuration file
├── server/
│   ├── Dockerfile             # Server container definition
│   └── (server code files)
└── client/
    ├── Dockerfile             # Client container definition
    ├── nginx.conf             # Web server config
    └── (client code files)
```

---

## That's It!

Once deployed, share your public IP with friends and start playing!

🎮 Access at: `http://YOUR_PUBLIC_IP`

For detailed troubleshooting and advanced setup, see [DEPLOYMENT.md](DEPLOYMENT.md)
