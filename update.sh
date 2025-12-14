#!/bin/bash

# Monopoly Game Update Script
# Run this on your server to pull latest changes and rebuild

set -e  # Exit on any error

echo "🎲 Monopoly Game Update Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found!${NC}"
    echo "Please run this script from the Monopoly directory"
    exit 1
fi

echo -e "${YELLOW}Step 1: Pulling latest code from GitHub...${NC}"
git pull origin main || git pull origin master

echo ""
echo -e "${YELLOW}Step 2: Stopping running containers...${NC}"
docker-compose down

echo ""
echo -e "${YELLOW}Step 3: Rebuilding containers...${NC}"
docker-compose build --no-cache

echo ""
echo -e "${YELLOW}Step 4: Starting containers...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}Step 5: Cleaning up old images...${NC}"
docker image prune -f

echo ""
echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
echo "Checking container status..."
docker-compose ps

echo ""
echo "To view logs, run:"
echo "  docker-compose logs -f"
echo ""
echo "To check game server health:"
echo "  curl http://localhost:3005/health"
