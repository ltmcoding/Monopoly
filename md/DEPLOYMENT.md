# Monopoly - Production Deployment Guide

## Prerequisites

- Docker installed on your server
- Portainer installed and running
- Your server's public IP address or domain name

## Port Forwarding Requirements

You need to forward these ports on your router/firewall:

- **Port 80** (HTTP) - For the web interface
- **Port 3001** (WebSocket) - For the game server

**Optional but recommended:**
- **Port 443** (HTTPS) - If you want to add SSL later

## Deployment Options

### Option 1: Using Portainer (Recommended)

#### Step 1: Prepare the Files

1. Upload the entire `Monopoly` folder to your server, or clone from git:
   ```bash
   cd /opt
   git clone <your-repo-url> monopoly
   cd monopoly
   ```

#### Step 2: Update Configuration

Edit `docker-compose.yml` and replace `YOUR_SERVER_IP` with your actual server IP or domain:

```yaml
- REACT_APP_SERVER_URL=http://YOUR_SERVER_IP:3001
```

For example:
- If your server IP is `192.168.1.100`: `http://192.168.1.100:3001`
- If you have a domain `game.example.com`: `http://game.example.com:3001`

#### Step 3: Deploy with Portainer

1. Open Portainer web interface
2. Go to **Stacks** → **Add Stack**
3. Name it: `monopoly`
4. Choose **Upload** method
5. Upload your `docker-compose.yml` file
6. Click **Deploy the stack**

Portainer will build and start both containers.

#### Step 4: Access Your Game

Open your browser and go to:
- `http://YOUR_SERVER_IP` (e.g., `http://192.168.1.100`)

### Option 2: Using Docker Compose Directly

If you prefer command line:

```bash
# Navigate to project directory
cd /opt/monopoly

# Edit docker-compose.yml with your server IP
nano docker-compose.yml

# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Firewall Configuration

### On Your Router

Forward these ports to your server's local IP:

| External Port | Internal Port | Protocol | Service |
|--------------|---------------|----------|---------|
| 80 | 80 | TCP | Web Interface |
| 3001 | 3001 | TCP | Game Server |

### On Your Server (if using ufw/iptables)

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow game server
sudo ufw allow 3001/tcp

# Optional: Allow HTTPS for future
sudo ufw allow 443/tcp

# Reload firewall
sudo ufw reload
```

## Verifying Deployment

### Check Container Status

In Portainer:
1. Go to **Containers**
2. Both `monopoly-server` and `monopoly-client` should show status **running**

Or via command line:
```bash
docker ps | grep monopoly
```

### Check Server Health

```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","games":0}`

### Check Logs

In Portainer:
1. Click on container name
2. Click **Logs** tab

Or via command line:
```bash
docker logs monopoly-server
docker logs monopoly-client
```

## Accessing from Outside Your Network

### Find Your Public IP

```bash
curl ifconfig.me
```

### Access the Game

Players can access the game at:
- `http://YOUR_PUBLIC_IP`

**Example:** If your public IP is `203.0.113.45`:
- Players visit: `http://203.0.113.45`

## Using a Domain Name (Optional)

If you have a domain name pointing to your server:

1. Update `docker-compose.yml`:
   ```yaml
   - REACT_APP_SERVER_URL=http://yourdomain.com:3001
   ```

2. Rebuild:
   ```bash
   docker-compose up -d --build
   ```

3. Players access at: `http://yourdomain.com`

## Adding SSL/HTTPS (Recommended for Production)

For secure connections, you can add Nginx reverse proxy with Let's Encrypt:

### Quick SSL Setup with Nginx

1. Install certbot on your server:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. Get SSL certificate:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. Update `docker-compose.yml` to use HTTPS URLs

4. Add Nginx reverse proxy (see NGINX-SSL.md for detailed config)

## Troubleshooting

### Containers won't start

```bash
# Check logs
docker logs monopoly-server
docker logs monopoly-client

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Can't connect from outside

1. Verify port forwarding on router
2. Check firewall rules on server
3. Verify server is listening:
   ```bash
   netstat -tlnp | grep -E '80|3001'
   ```

### WebSocket connection fails

1. Ensure port 3001 is accessible
2. Check that `REACT_APP_SERVER_URL` matches your actual server address
3. Try using IP address instead of domain name

### Players can't join

1. Check server logs: `docker logs monopoly-server`
2. Verify both containers are running: `docker ps`
3. Test health endpoint: `curl http://localhost:3001/health`

## Updating the Application

### Method 1: Portainer

1. Go to **Stacks** → **monopoly**
2. Click **Editor**
3. Click **Update the stack**
4. Check **Re-pull image and redeploy**
5. Click **Update**

### Method 2: Command Line

```bash
cd /opt/monopoly

# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Resource Requirements

**Minimum:**
- CPU: 1 core
- RAM: 512MB
- Disk: 1GB

**Recommended for 10+ concurrent games:**
- CPU: 2 cores
- RAM: 2GB
- Disk: 2GB

## Monitoring

### View Active Games

```bash
curl http://localhost:3001/health
```

Returns: `{"status":"ok","games":5}` (shows number of active games)

### Container Resource Usage

```bash
docker stats monopoly-server monopoly-client
```

## Backup

Important files to backup:
- `docker-compose.yml` - Your configuration
- Any `.env` files you created

Game state is stored in memory, so games are lost on restart. For persistent games, you would need to add Redis (future enhancement).

## Production Checklist

- [ ] Port 80 forwarded
- [ ] Port 3001 forwarded
- [ ] Firewall rules configured
- [ ] `docker-compose.yml` updated with correct server IP/domain
- [ ] Containers running (`docker ps`)
- [ ] Health check passing (`curl http://localhost:3001/health`)
- [ ] Accessible from external network
- [ ] (Optional) SSL certificate installed
- [ ] (Optional) Domain name configured

## Getting Help

If you run into issues:

1. Check container logs: `docker logs monopoly-server`
2. Verify network connectivity: `curl http://localhost:3001/health`
3. Check Docker status: `docker ps -a`
4. Review this deployment guide

---

**Your game should now be accessible to anyone on the internet at `http://YOUR_SERVER_IP`!**

Enjoy! 🎲🏠💰
