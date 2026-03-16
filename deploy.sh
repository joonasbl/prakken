#!/bin/bash
set -e

# =============================================================================
# Prakken Frontend Deploy Script
# Builds Docker image locally, transfers to VPS, and deploys with Podman
#
# Usage:
#   ./deploy.sh                        # Deploy production (prakken.dedyn.io)
#   ./deploy.sh test                   # Deploy test (test.prakken.dedyn.io)
#   IMAGE_TAG=test ./deploy.sh         # Deploy specific tag to production
#   ./deploy.sh test --tag latest      # Deploy test with specific tag
# =============================================================================

# Configuration - Can be overridden via environment variables
# Usage: VPS_USER=myuser VPS_HOST=myhost.com ./deploy.sh
VPS_USER="${VPS_USER:-opc}"
VPS_HOST="${VPS_HOST:-prakken.dedyn.io}"
IMAGE_NAME="${IMAGE_NAME:-prakken-frontend}"

# Check if deploying to test environment
DEPLOY_TARGET="production"
if [ "$1" = "test" ]; then
    DEPLOY_TARGET="test"
    IMAGE_TAG="${IMAGE_TAG:-test}"
    CONTAINER_NAME="prakken-test"
    CONTAINER_PORT="3001"
    SUBDOMAIN="test"
    shift
fi

# Handle --tag argument
while [[ $# -gt 0 ]]; do
    case $1 in
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Default values for production
if [ "$DEPLOY_TARGET" = "production" ]; then
    IMAGE_TAG="${IMAGE_TAG:-latest}"
    CONTAINER_NAME="prakken-frontend"
    CONTAINER_PORT="3000"
    SUBDOMAIN=""
fi

TEMP_TAR="${IMAGE_NAME}-${IMAGE_TAG}.tar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}==>${NC} $1"
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
log_step "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
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
log_info "Deploying ${DEPLOY_TARGET} on VPS..."

ssh "${VPS_USER}@${VPS_HOST}" bash -s << EOF
set -e

echo "=========================================="
echo "  Deploying Prakken ${DEPLOY_TARGET^}"
echo "=========================================="
echo ""

echo "[1/6] Loading image..."
podman load -i ~/${TEMP_TAR}

echo "[2/6] Waiting for image to be ready..."
sleep 2

echo "[3/6] Stopping existing container..."
podman rm -f ${CONTAINER_NAME} 2>/dev/null || true

echo "[4/6] Starting new container..."
podman run -d --name ${CONTAINER_NAME} \\
  --restart=always \\
  -p ${CONTAINER_PORT}:80 \\
  docker.io/library/${IMAGE_NAME}:${IMAGE_TAG}

echo "[5/6] Waiting for container to start..."
sleep 2

echo "[6/6] Checking container status..."
podman ps --filter name=${CONTAINER_NAME}

echo ""
echo "=========================================="
echo "  Cleanup old image"
echo "=========================================="
podman rmi ${IMAGE_NAME}:${IMAGE_TAG} 2>/dev/null || true
echo "✓ Cleaned up old image"

echo ""
echo "=========================================="
echo "  Container Logs (last 20 lines)"
echo "=========================================="
podman logs --tail 20 ${CONTAINER_NAME}

echo ""
echo "=========================================="
echo "  Testing Local Connection"
echo "=========================================="
if curl -s -o /dev/null -w "%{http_code}" http://localhost:${CONTAINER_PORT} | grep -q "200"; then
  echo "✓ Container is responding on port ${CONTAINER_PORT}"
else
  echo "⚠ Container may not be ready yet. Check logs above."
fi

echo ""
echo "=========================================="
echo "  Cleanup"
echo "=========================================="
rm -f ~/${TEMP_TAR}
echo "✓ Cleaned up tar file"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
if [ -n "${SUBDOMAIN}" ]; then
  echo "Test site: https://${SUBDOMAIN}.${VPS_HOST}"
else
  echo "Production site: https://${VPS_HOST}"
fi
echo ""
EOF

# =============================================================================
# Step 5: Local cleanup
# =============================================================================
rm -f "$TEMP_TAR"

log_info "Deployment complete!"
if [ -n "$SUBDOMAIN" ]; then
    log_info "Test site: https://${SUBDOMAIN}.${VPS_HOST}"
else
    log_info "Production site: https://${VPS_HOST}"
fi
