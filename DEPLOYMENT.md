# SMG E-Commerce — Deployment Guide

## Project Structure

```
SMG_WebSite/
├── backend/                   # Node.js / Express API
│   ├── src/
│   ├── uploads/               # User-uploaded images (Docker volume)
│   ├── Dockerfile
│   ├── .env                   # Local dev (git-ignored)
│   └── .env.production.example
├── frontend/                  # React / Vite SPA
│   ├── src/
│   ├── Dockerfile             # Multi-stage: build → Nginx
│   └── nginx.conf             # Nginx config inside the container
├── nginx/
│   └── smg.conf               # VPS reverse-proxy config
├── .github/
│   └── workflows/deploy.yml   # CI/CD — auto-deploy on push to main
├── docker-compose.yml         # Production
├── docker-compose.dev.yml     # Local development
├── deploy.sh                  # First-time VPS setup script
└── .gitignore
```

---

## 1. Local Development (Docker)

```bash
docker compose -f docker-compose.dev.yml up --build
```

| Service   | URL                       |
|-----------|---------------------------|
| Frontend  | http://localhost:5173     |
| Backend   | http://localhost:5000     |
| MongoDB   | mongodb://localhost:27017 |

Changes to `backend/src/` and `frontend/src/` hot-reload automatically.

---

## 2. Local Development (without Docker)

### Backend
```bash
cd backend
cp .env.production.example .env   # fill in values
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 3. GitHub Setup

```bash
# Initialise git at the project root
cd SMG_WebSite
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 4. VPS First-Time Deployment

### 4a. Prepare secrets on the VPS

SSH into your VPS and create the production env file **before** running the deploy script:

```bash
ssh user@your-vps-ip
sudo mkdir -p /opt/smg/backend
sudo nano /opt/smg/backend/.env.production
```

Paste and fill in:
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/smg_ecommerce
JWT_SECRET=<strong-random-64-char-secret>
JWT_EXPIRE=30d
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

> Generate a secret: `openssl rand -hex 64`

### 4b. Run the deploy script

```bash
# Edit REPO_URL and DOMAIN in deploy.sh first, then:
chmod +x deploy.sh
sudo ./deploy.sh
```

The script will:
- Install Docker, Docker Compose, and Nginx
- Clone the repo into `/opt/smg`
- Build and start all containers
- Configure Nginx as a reverse-proxy on port 80

### 4c. Enable HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot auto-renews — no further action needed.

---

## 5. GitHub Actions CI/CD (Auto-deploy)

Every `git push origin main` triggers an automatic deployment.

### Required GitHub Secrets

Go to: **GitHub repo → Settings → Secrets and variables → Actions**

| Secret       | Value                                    |
|--------------|------------------------------------------|
| `VPS_HOST`   | Your VPS IP address or hostname          |
| `VPS_USER`   | SSH username (e.g. `ubuntu` or `root`)   |
| `VPS_SSH_KEY`| Your **private** SSH key (`~/.ssh/id_rsa`) |
| `VPS_PORT`   | SSH port (default: `22`)                 |

### Generate an SSH key pair for deployment

```bash
# On your local machine
ssh-keygen -t ed25519 -C "smg-deploy" -f ~/.ssh/smg_deploy

# Copy the PUBLIC key to the VPS
ssh-copy-id -i ~/.ssh/smg_deploy.pub user@your-vps-ip

# Add the PRIVATE key content to GitHub secret VPS_SSH_KEY
cat ~/.ssh/smg_deploy
```

---

## 6. Manual Deployment (without CI/CD)

```bash
ssh user@your-vps-ip
cd /opt/smg
git pull origin main
docker compose build --no-cache
docker compose up -d --remove-orphans
docker image prune -f
```

---

## 7. Useful Docker Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart a single service
docker compose restart backend

# Stop everything
docker compose down

# Stop and wipe volumes (⚠️ deletes DB data)
docker compose down -v

# Access MongoDB shell
docker exec -it smg_mongo mongosh smg_ecommerce
```

---

## 8. Environment Variables Reference

### Backend `.env.production`

| Variable      | Description                               | Example                              |
|---------------|-------------------------------------------|--------------------------------------|
| `PORT`        | API port inside container                 | `5000`                               |
| `NODE_ENV`    | Environment mode                          | `production`                         |
| `MONGO_URI`   | MongoDB connection string                 | `mongodb://mongo:27017/smg_ecommerce`|
| `JWT_SECRET`  | JWT signing secret (min 64 chars)         | `openssl rand -hex 64`               |
| `JWT_EXPIRE`  | Token expiry                              | `30d`                                |
| `CORS_ORIGIN` | Comma-separated allowed origins           | `https://yourdomain.com`             |

---

## 9. Architecture Diagram

```
Internet
    │
    ▼
[VPS Nginx :80/:443]  ← SSL via Let's Encrypt
    │
    ▼
[Docker: smg_frontend :3000]
   Nginx inside container:
   - Serves React SPA static files
   - /api/* → proxy → smg_backend:5000
   - /uploads/* → proxy → smg_backend:5000
    │
    ▼
[Docker: smg_backend :5000]
   Express API
    │
    ▼
[Docker: smg_mongo]
   MongoDB (internal network only)
```
