# GitHub Actions Deployment Guide

## Overview

Prakken uses GitHub Actions to automatically build and deploy the frontend when you push a version tag.

## How to Deploy

### 1. Push a New Version Tag

```bash
# Make your changes
git add .
git commit -m "feat: add new feature"

# Create and push a version tag
git tag -a v1.2.0 -m "Prakken v1.2.0"
git push origin v1.2.0
```

### 2. GitHub Actions Runs Automatically

The workflow will:
1. ✅ Run tests
2. ✅ Run type check
3. ✅ Run lint
4. ✅ Build the app
5. ✅ Build Docker image
6. ✅ Create GitHub release with Docker tar
7. ✅ Deploy to VPS
8. ✅ Verify deployment

### 3. Monitor Progress

Go to: **https://github.com/yourusername/prakken/actions**

Watch the "Build, Release & Deploy" workflow run.

### 4. Verify Deployment

Once complete, visit: **https://prakken.dedyn.io**

---

## Workflow Details

### File: `.github/workflows/deploy.yml`

#### Jobs:

**1. create-release**
- Creates GitHub release
- Generates release notes from commits

**2. build-frontend**
- Checks out code
- Sets up Node.js 22
- Installs dependencies
- **Runs tests** (`npm run test:unit -- --run`)
- **Runs type check** (`npm run type-check`)
- **Runs lint** (`npm run lint`)
- Builds app (`npm run build`)
- Builds Docker image
- Saves to tar file
- Uploads to GitHub release
- Uploads artifact for deploy job

**3. deploy**
- Downloads artifact
- Transfers to VPS via SCP
- Deploys with Podman
- Verifies container is running
- Tests local connection
- Cleans up tar file
- Verifies HTTPS endpoint

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions (on tag push)                           │
│  1. Test, lint, type-check                              │
│  2. Build Docker image                                  │
│  3. Upload to GitHub Release                            │
│  4. Deploy to VPS                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  VPS (Oracle Cloud)                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Caddy Container (Port 443)                      │   │
│  │  - SSL/TLS (Let's Encrypt)                       │   │
│  │  - Auto-renewal                                  │   │
│  │  - Reverse proxy                                 │   │
│  └────────────┬────────────────────────────────────┘   │
│               │ (HTTP port 3000)                        │
│               ▼                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Prakken Container (Port 3000)                   │   │
│  │  - Nginx serving Vue.js                          │   │
│  │  - Plain HTTP                                    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Manual Trigger

You can also trigger deployment manually:

1. Go to: **https://github.com/yourusername/prakken/actions/workflows/deploy.yml**
2. Click "Run workflow"
3. Select branch or tag
4. Click "Run workflow"

---

## Quality Gates

The deployment will **fail** if:

- ❌ Tests fail
- ❌ Type check fails
- ❌ Lint fails
- ❌ Build fails
- ❌ VPS deployment fails

This ensures only working code is deployed!

---

## Rollback

If something goes wrong:

### Option 1: Redeploy Previous Version

```bash
# Find previous working tag
git tag --list

# Redeploy it
git push origin v1.1.0
```

### Option 2: Manual Rollback on VPS

```bash
# SSH to VPS
ssh opc@79.76.40.176

# List available images
podman images | grep prakken

# Stop current container
podman stop prakken-frontend

# Run previous version
podman run -d --name prakken-frontend \
  --restart=always \
  -p 3000:80 \
  prakken-frontend:v1.1.0
```

---

## Environment Variables

These GitHub Secrets are required:

| Secret | Description | Example |
|--------|-------------|---------|
| `VPS_HOST` | VPS IP address | `79.76.40.176` |
| `VPS_USER` | VPS username | `opc` |
| `VPS_SSH_KEY` | SSH private key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### Set Up Secrets

1. Go to: **https://github.com/yourusername/prakken/settings/secrets/actions**
2. Click "New repository secret"
3. Add each secret

---

## Troubleshooting

### Deployment Fails at "Run tests"

```bash
# Run tests locally
cd frontend
npm run test:unit -- --run

# Fix failing tests
git add .
git commit -m "fix: failing tests"
git push origin v1.2.0  # Push tag again
```

### Deployment Fails at "Deploy on VPS"

Check VPS:
```bash
# SSH to VPS
ssh opc@79.76.40.176

# Check Podman
podman ps -a | grep prakken

# Check logs
podman logs prakken-frontend
```

### Site Not Loading After Deploy

```bash
# Check Caddy is running
podman ps | grep caddy

# Check Caddy logs
podman logs caddy

# Check Prakken is running
podman ps | grep prakken

# Test locally on VPS
curl -I http://localhost:3000
```

---

## Release Notes

GitHub automatically generates release notes from:
- Commit messages
- Pull request titles
- Tags

You can edit release notes after deployment:
1. Go to: **https://github.com/yourusername/prakken/releases**
2. Click on the release
3. Click edit
4. Update notes
5. Save

---

## Best Practices

1. **Always test locally first:**
   ```bash
   npm run test:unit -- --run
   npm run type-check
   npm run lint
   npm run build
   ```

2. **Use semantic versioning:**
   - `v1.0.0` - Major release
   - `v1.1.0` - Minor feature
   - `v1.1.1` - Bug fix

3. **Write clear commit messages:**
   ```
   feat: add user authentication
   fix: resolve login issue
   docs: update README
   ```

4. **Monitor deployments:**
   - Watch GitHub Actions
   - Check VPS logs
   - Test site after deploy

---

## Local Deployment Script

For testing without Git:

```bash
# From project root
./scripts/deploy-frontend.sh opc 79.76.40.176
./scripts/remote-deploy-vps.sh opc 79.76.40.176
```

See `scripts/DEPLOYMENT.md` for details.

---

## Support

For issues:
1. Check GitHub Actions logs
2. Check VPS logs (`podman logs`)
3. Review `scripts/DEPLOYMENT.md`
4. Check Caddy logs for SSL issues
