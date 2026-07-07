#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# deploy.sh — First-time VPS setup + subsequent deployments
#
# Usage:
#   chmod +x deploy.sh
#   sudo ./deploy.sh          (first run)
#   ./deploy.sh               (subsequent pulls)
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/opt/smg"
REPO_URL="https://github.com/Abdosalh998/SMG-Website.git"   # ← CHANGE THIS
DOMAIN="smgturbofan.com"                                       # ← CHANGE THIS
APP_PORT="3000"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }

# ─── 1. Install Docker if missing ───────────────────────────────────────────
if ! command -v docker &>/dev/null; then
    info "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
    info "Docker installed."
fi

# ─── 2. Install Docker Compose plugin if missing ────────────────────────────
if ! docker compose version &>/dev/null; then
    info "Installing Docker Compose plugin..."
    apt-get install -y docker-compose-plugin
fi

# ─── 3. Install Nginx if missing ────────────────────────────────────────────
if ! command -v nginx &>/dev/null; then
    info "Installing Nginx..."
    apt-get update && apt-get install -y nginx
    systemctl enable --now nginx
fi

# ─── 4. Clone or pull project ───────────────────────────────────────────────
if [ ! -d "$APP_DIR/.git" ]; then
    info "Cloning repository into $APP_DIR..."
    git clone "$REPO_URL" "$APP_DIR"
else
    info "Pulling latest code..."
    git -C "$APP_DIR" pull origin main
fi

cd "$APP_DIR"

# ─── 5. Ensure .env.production exists ───────────────────────────────────────
if [ ! -f "backend/.env.production" ]; then
    warning "backend/.env.production not found!"
    warning "Copy backend/.env.production.example → backend/.env.production and fill in real values, then re-run this script."
    exit 1
fi

# ─── 6. Build & start containers ────────────────────────────────────────────
info "Building and starting Docker containers..."
docker compose build --no-cache
docker compose up -d --remove-orphans
docker image prune -f

# ─── 7. Configure Nginx reverse-proxy ───────────────────────────────────────
NGINX_CONF="/etc/nginx/sites-available/smg"

if [ ! -f "$NGINX_CONF" ]; then
    info "Installing Nginx site config..."
    cp "$APP_DIR/nginx/smg.conf" "$NGINX_CONF"
    # Replace placeholder domain
    sed -i "s/yourdomain.com/$DOMAIN/g" "$NGINX_CONF"
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/smg
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    info "Nginx configured. Point your DNS to this server's IP, then run:"
    info "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
else
    info "Nginx config already exists — reloading..."
    nginx -t && systemctl reload nginx
fi

info "✅  Deployment complete! App running on port $APP_PORT."
info "    Visit: https://$DOMAIN"
