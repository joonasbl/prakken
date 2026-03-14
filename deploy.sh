#!/bin/bash
set -e

# =============================================================================
# Prakken Frontend Deploy Script
# Builds Docker image locally, transfers to VPS, and deploys with Podman
# =============================================================================

# Configuration - Can be overridden via environment variables
# Usage: VPS_USER=myuser VPS_HOST=myhost.com ./deploy.sh
VPS_USER="${VPS_USER:-opc}"
VPS_HOST="${VPS_HOST:-prakken.dedyn.io}"
IMAGE_NAME="${IMAGE_NAME:-prakken-frontend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-prakken-frontend}"
TEMP_TAR="${IMAGE_NAME}.tar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}==>${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}==>${NC} $1"
}

log_error() {
    echo -e "${RED}==>${NC} $1"
}

# Cleanup function for errors
cleanup_on_error() {
    log_warn "Deployment failed. Cleaning up..."
    rm -f "$TEMP_TAR"
    exit 1
}

trap cleanup_on_error ERR

# =============================================================================
# Step 1: Build Docker image locally
# =============================================================================
log_info "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" ./frontend -f ./frontend/Dockerfile.prod

# =============================================================================
# Step 2: Save image to tar file
# =============================================================================
log_info "Saving image to ${TEMP_TAR}"
docker save -o "$TEMP_TAR" "${IMAGE_NAME}:${IMAGE_TAG}"

# =============================================================================
# Step 3: Transfer image to VPS
# =============================================================================
log_info "Transferring image to ${VPS_USER}@${VPS_HOST}"
scp "$TEMP_TAR" "${VPS_USER}@${VPS_HOST}:~/"

# =============================================================================
# Step 4: Deploy on VPS with Podman
# =============================================================================
log_info "Deploying on VPS..."

ssh "${VPS_USER}@${VPS_HOST}" bash -s << 'EOF'
set -e

echo "Loading image..."
podman load -i ~/prakken-frontend.tar

echo "Stopping existing container..."
podman rm -f prakken-frontend 2>/dev/null || true

echo "Starting new container..."
podman run -d --name prakken-frontend \
  -p 80:80 -p 443:443 \
  -v /home/opc/.acme.sh/prakken.dedyn.io_ecc/fullchain.cer:/etc/ssl/certs/fullchain.cer:ro \
  -v /home/opc/.acme.sh/prakken.dedyn.io_ecc/prakken.dedyn.io.key:/etc/ssl/private/prakken.key:ro \
  prakken-frontend:latest

echo "Cleaning up tar file..."
rm ~/prakken-frontend.tar

echo "Container status:"
podman ps --filter name=prakken-frontend
EOF

# =============================================================================
# Step 5: Local cleanup
# =============================================================================
rm -f "$TEMP_TAR"

log_info "Deployment complete!"
log_info "Frontend available at https://${VPS_HOST}"
