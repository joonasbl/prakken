# Prakken Deployment Guide

This guide covers deploying Prakken to your VPS using Podman.

## Quick Start

### Deploy to Production

```bash
# From project root
./deploy.sh
```

### Deploy to Test Environment

```bash
./deploy.sh test
```

That's it! Your site will be live at:
- **Production**: https://prakken.dedyn.io
- **Test**: https://test.prakken.dedyn.io

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet (HTTPS)                      │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│  Caddy Container (Port 443)                              │
│  - Handles SSL/TLS (Let's Encrypt)                       │
│  - Auto-renews certificates                              │
│  - Reverse proxy to Prakken                              │
└────────────┬────────────────────────────────────────────┘
             │ (HTTP port 80)
             ▼
┌─────────────────────────────────────────────────────────┐
│  Prakken Frontend (Nginx, Port 80)                       │
│  - Vue.js production build                               │
│  - Nginx reverse proxy to backend                        │
│  - Gzip compression & caching                            │
└────────────┬────────────────────────────────────────────┘
             │ (HTTP port 8080)
             ▼
┌─────────────────────────────────────────────────────────┐
│  Prakken Backend (Go, Port 8080)                         │
│  - Gin REST API                                          │
│  - Shopping system                                       │
│  - Character management                                  │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL 18.3 (Port 5432)                             │
│  - Character data                                        │
│  - Shopping items & categories                           │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Methods

### Method 1: Git Sync + Build on VPS (Recommended)

Best for full-stack deployments with PostgreSQL.

**Steps:**

1. **SSH to VPS:**
   ```bash
   ssh opc@prakken.dedyn.io
   ```

2. **Navigate to project:**
   ```bash
   cd /home/opc/prakken
   ```

3. **Pull latest code:**
   ```bash
   git pull origin master
   ```

4. **Rebuild and restart:**
   ```bash
   podman-compose down
   podman-compose up -d --build
   ```

5. **View logs:**
   ```bash
   podman-compose logs -f
   ```

**Note:** The VPS build skips TypeScript type-checking to save memory. Always run `npm run type-check` locally before committing.

**Advantages:**
- ✅ PostgreSQL pulls from Docker Hub (no transfer needed)
- ✅ Only code transfers (fast)
- ✅ Backend and Frontend build quickly on VPS
- ✅ Cleaner workflow with docker-compose
- ✅ Optimized for low-memory VPS (skips type-check)

---

### Method 2: Local Build + Transfer (Legacy)

For frontend-only updates.

**Deploy Script:**

```bash
# Production
./deploy.sh

# Test environment
./deploy.sh test
```

**What it does:**

1. ✅ Builds Docker image locally (`prakken-frontend:latest`)
2. ✅ Saves to tar file
3. ✅ Transfers to VPS via SCP
4. ✅ Deploys with Podman
5. ✅ Cleans up temporary files

**Manual Steps (if needed):**

```bash
# On local machine
cd frontend
docker build -t prakken-frontend:latest -f Dockerfile.prod .
docker save -o prakken-frontend.tar prakken-frontend:latest
scp prakken-frontend.tar opc@prakken.dedyn.io:~/

# On VPS
podman load -i ~/prakken-frontend.tar
podman stop prakken-frontend 2>/dev/null || true
podman rm prakken-frontend
podman run -d --name prakken-frontend \
  --restart=always \
  -p 80:80 \
  prakken-frontend:latest
rm ~/prakken-frontend.tar
```

---

## Configuration Files

### Docker Compose (docker-compose.yml)

Full-stack orchestration:

```yaml
services:
  postgres:      # PostgreSQL 18.3 database
  backend:       # Go API server
  frontend:      # Vue.js + Nginx
```

### Frontend Dockerfile (frontend/Dockerfile.prod)

Multi-stage build:

```dockerfile
# Stage 1: Build Vue.js app
FROM node:22-alpine AS builder
RUN npm ci && npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Nginx Config (frontend/nginx/nginx.conf)

Production configuration:

- Gzip compression
- Static asset caching (1 year)
- API proxy to backend (`/api/` → `http://backend:8080`)
- SPA routing support
- Security headers

---

## Environment Variables

### Frontend (.env.example)

```bash
VITE_API_URL=/api
```

### Backend (docker-compose.yml)

```bash
DATABASE_URL=postgres://postgres:postgres@postgres:5432/prakken?sslmode=disable
PORT=8080
GIN_MODE=release
```

---

## Troubleshooting

### Check Container Status

```bash
# All containers
podman ps -a

# Specific container
podman ps --filter name=prakken

# View logs
podman logs prakken-frontend
podman logs prakken-backend
podman logs prakken-db
```

### Database Issues

```bash
# Check PostgreSQL is healthy
podman ps --filter name=prakken-db

# View database logs
podman logs prakken-db

# Connect to database
podman exec -it prakken-db psql -U postgres -d prakken
```

### Backend API Issues

```bash
# Test API locally on VPS
curl http://localhost:8080/health
curl http://localhost:8080/api/shopping/items

# Check backend logs
podman logs prakken-backend
```

### Frontend Issues

```bash
# Test Nginx locally on VPS
curl http://localhost:80

# Check Nginx config
podman exec prakken-frontend nginx -t

# View Nginx logs
podman logs prakken-frontend
```

### HTTPS/SSL Issues

```bash
# Check Caddy is running
podman ps | grep caddy

# Check Caddy logs
podman logs caddy

# Test SSL certificate
curl -I https://prakken.dedyn.io
```

### DNS Issues

```bash
# Check DNS resolution
dig prakken.dedyn.io
dig test.prakken.dedyn.io

# Check DNS propagation
# https://dnschecker.org/
```

### Port Conflicts

```bash
# Check what's using ports
sudo ss -tlnp | grep :80
sudo ss -tlnp | grep :8080
sudo ss -tlnp | grep :5432
```

### Rebuild Specific Service

```bash
# Frontend only
podman-compose up -d --build frontend

# Backend only
podman-compose up -d --build backend

# All services
podman-compose up -d --build
```

### Reset Everything

```bash
# Stop and remove all containers + volumes
podman-compose down -v

# Start fresh
podman-compose up -d --build
```

---

## Monitoring

### View Live Logs

```bash
# All services
podman-compose logs -f

# Specific service
podman-compose logs -f frontend
podman-compose logs -f backend
```

### Check Resource Usage

```bash
podman stats
```

### Database Health

```bash
podman exec prakken-db pg_isready -U postgres
```

---

## Backup and Restore

### Backup Database

```bash
podman exec prakken-db pg_dump -U postgres prakken > backup.sql
```

### Restore Database

```bash
podman exec -i prakken-db psql -U postgres prakken < backup.sql
```

### Backup Volumes

```bash
# Create backup archive
tar -czf prakken-data-backup.tar.gz /var/lib/containers/storage/volumes/prakken_postgres_data
```

---

## Best Practices

1. **Always test locally first:**
   ```bash
   docker-compose up -d --build
   ```

2. **Monitor after deploy:**
   ```bash
   podman-compose logs -f
   ```

3. **Keep git synced:**
   ```bash
   git pull origin master
   ```

4. **Clean up old images:**
   ```bash
   podman image prune -f
   ```

5. **Monitor disk space:**
   ```bash
   df -h
   podman system df
   ```

6. **Set up log rotation** (in `/etc/containers/containers.conf`):
   ```ini
   [containers]
   log_size_max = "10m"
   log_max_size = "5"
   ```

---

## Support

For issues or questions:

1. Check logs: `podman-compose logs -f`
2. Verify services: `podman ps`
3. Test connectivity: `curl http://localhost:8080/health`
4. Check DNS: `dig prakken.dedyn.io`
5. Test SSL: `curl -I https://prakken.dedyn.io`

---

## Version History

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| 2.0.0   | Mar 2026   | Full-stack with PostgreSQL       |
| 1.4.0   | Feb 2026   | Nginx production build           |
| 1.3.0   | Jan 2026   | Shopping system                  |
| 1.0.0   | Dec 2025   | Initial release                  |
