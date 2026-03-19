# Prakken Deployment Scripts

This folder contains scripts for deploying Prakken to your VPS.

## Quick Start

### Full Deployment (Build + Transfer + Deploy)

```bash
# From project root
./scripts/deploy-frontend.sh opc 79.76.40.176
./scripts/remote-deploy-vps.sh opc 79.76.40.176
```

That's it! Your site will be live at https://prakken.dedyn.io

---

## Scripts Overview

### 1. `deploy-frontend.sh` (Local Machine)

Builds the Docker image and transfers it to the VPS.

**Usage:**

```bash
./scripts/deploy-frontend.sh [VPS_USER] [VPS_HOST]
```

**Example:**

```bash
./scripts/deploy-frontend.sh opc 79.76.40.176
```

**What it does:**

1. ✅ Checks dependencies (Docker, SCP)
2. ✅ Builds Docker image (`prakken-frontend:latest`)
3. ✅ Saves to tar file (`prakken-frontend.tar`)
4. ✅ Transfers to VPS (`/tmp/prakken-frontend.tar`)
5. ✅ Cleans up local tar file

---

### 2. `remote-deploy-vps.sh` (Local Machine)

SSHs into the VPS and deploys the container.

**Usage:**

```bash
./scripts/remote-deploy-vps.sh [VPS_USER] [VPS_HOST]
```

**Example:**

```bash
./scripts/remote-deploy-vps.sh opc 79.76.40.176
```

**What it does:**

1. ✅ Stops old container
2. ✅ Removes old image
3. ✅ Loads new image from tar
4. ✅ Runs new container on port 3000
5. ✅ Verifies container is running
6. ✅ Cleans up tar file

**Requirements:**

- SSH key-based authentication (no password)
- Run `deploy-frontend.sh` first to transfer the image

---

### 3. `provision_subdomain.py` (DNS Management)

Creates DNS records via deSEC.io API.

**Usage:**

```bash
python3 scripts/provision_subdomain.py \
  --token YOUR_TOKEN \
  --domain prakken.dedyn.io \
  --subname www \
  --type A \
  --records 79.76.40.176
```

**See full documentation:** `provision.readme.md`

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet (HTTPS)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Caddy Container (Port 443)                              │
│  - Handles SSL/TLS (Let's Encrypt)                       │
│  - Auto-renews certificates                              │
│  - Reverse proxy to Prakken                              │
└────────────────────┬────────────────────────────────────┘
                     │ (HTTP port 3000)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Prakken Container (Port 3000)                           │
│  - Nginx serving Vue.js app                              │
│  - Plain HTTP (no SSL needed)                            │
│  - SPA routing                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Manual Deployment (Alternative)

If you prefer manual commands:

### On Local Machine:

```bash
cd frontend

# Build image
docker build -t prakken-frontend:latest -f Dockerfile.prod .

# Save to tar
docker save -o prakken-frontend.tar prakken-frontend:latest

# Transfer to VPS
scp prakken-frontend.tar opc@79.76.40.176:/tmp/
```

### On VPS:

```bash
# Stop old container
podman stop prakken-frontend
podman rm prakken-frontend

# Load new image
podman load -i /tmp/prakken-frontend.tar

# Run container
podman run -d --name prakken-frontend \
  --restart=always \
  -p 3000:80 \
  prakken-frontend:latest

# Check logs
podman logs -f prakken-frontend
```

---

## Troubleshooting

### SSH Connection Fails

```bash
# Set up SSH key
ssh-copy-id opc@79.76.40.176

# Test connection
ssh opc@79.76.40.176
```

### Container Won't Start

```bash
# Check logs
podman logs prakken-frontend

# Check if port is in use
sudo ss -tlnp | grep :3000

# Check container status
podman ps -a | grep prakken
```

### HTTPS Not Working

```bash
# Check Caddy is running
podman ps | grep caddy

# Check Caddy logs
podman logs caddy

# Test SSL
curl -I https://prakken.dedyn.io
```

### DNS Not Resolving

```bash
# Check DNS propagation
dig prakken.dedyn.io

# Or use online tool
# https://dnschecker.org/
```

---

## Configuration Files

### Nginx Config

Location: `frontend/nginx/nginx.conf`

- HTTP only (port 80)
- No SSL configuration
- SPA routing for Vue.js
- Gzip compression
- Security headers

### Dockerfile

Location: `frontend/Dockerfile.prod`

- Multi-stage build
- Node.js for building
- Nginx Alpine for serving
- Exposes port 80

---

## Best Practices

1. **Always run both scripts** in order:
   - `deploy-frontend.sh` first (builds & transfers)
   - `remote-deploy-vps.sh` second (deploys)

2. **Set up SSH keys** to avoid password prompts:

   ```bash
   ssh-copy-id opc@79.76.40.176
   ```

3. **Test locally** before deploying:

   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

4. **Monitor after deploy**:

   ```bash
   # Watch container logs
   podman logs -f prakken-frontend

   # Watch Caddy logs
   podman logs -f caddy
   ```

5. **Backup before major updates**:
   ```bash
   # Save current image
   podman save -o prakken-backup.tar prakken-frontend:latest
   ```

---

## Support

For issues or questions:

1. Check logs: `podman logs prakken-frontend`
2. Check Caddy logs: `podman logs caddy`
3. Verify DNS: `dig prakken.dedyn.io`
4. Test connection: `curl -I https://prakken.dedyn.io`
