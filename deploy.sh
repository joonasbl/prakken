#!/bin/bash
set -e

# =============================================================================
# Prakken Deploy Script
# Deploys Prakken to VPS using git sync + podman-compose (recommended)
# or local Docker build + transfer (legacy mode)
#
# Usage:
#   ./deploy.sh                        # Deploy production (git sync)
#   ./deploy.sh --build                # Deploy with local build (legacy)
#   ./deploy.sh test                   # Deploy test environment
# =============================================================================

# Configuration
VPS_USER="${VPS_USER:-opc}"
VPS_HOST="${VPS_HOST:-prakken.dedyn.io}"
VPS_PATH="${VPS_PATH:-/home/opc/prakken}"
DEPLOY_METHOD="${DEPLOY_METHOD:-git}"  # git or build

# Check if deploying to test environment
DEPLOY_TARGET="production"
if [ "$1" = "test" ]; then
    DEPLOY_TARGET="test"
    shift
fi

# Handle arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            DEPLOY_METHOD="build"
            shift
            ;;
        --method)
            DEPLOY_METHOD="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}==>${NC} $1"; }
log_warn() { echo -e "${YELLOW}==>${NC} $1"; }
log_error() { echo -e "${RED}==>${NC} $1"; }
log_step() { echo -e "${BLUE}==>${NC} $1"; }

# =============================================================================
# Method 1: Git Sync + Build on VPS (Recommended)
# =============================================================================
deploy_git() {
    log_step "Deploying ${DEPLOY_TARGET} via git sync..."
    log_info "This method builds containers on the VPS (recommended)"
    
    ssh "${VPS_USER}@${VPS_HOST}" bash -s << EOF
set -e

echo "=========================================="
echo "  Deploying Prakken ${DEPLOY_TARGET^}"
echo "  Method: Git Sync + Build on VPS"
echo "=========================================="
echo ""

echo "[1/5] Navigating to project..."
cd ${VPS_PATH}

echo "[2/5] Pulling latest code..."
git pull origin master

echo "[3/5] Stopping existing containers..."
podman-compose down || true

echo "[4/5] Building and starting containers..."
podman-compose up -d --build

echo "[5/5] Cleaning up old images..."
podman image prune -f

echo ""
echo "=========================================="
echo "  Container Status"
echo "=========================================="
podman ps --filter name=prakken

echo ""
echo "=========================================="
echo "  Recent Logs"
echo "=========================================="
podman-compose logs --tail=10

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
if [ "${DEPLOY_TARGET}" = "test" ]; then
  echo "Test site: https://test.${VPS_HOST}"
else
  echo "Production site: https://${VPS_HOST}"
fi
echo ""
EOF
}

# =============================================================================
# Method 2: Local Build + Transfer (Legacy)
# =============================================================================
deploy_build() {
    IMAGE_NAME="${IMAGE_NAME:-prakken-frontend}"
    IMAGE_TAG="${DEPLOY_TARGET}"
    CONTAINER_NAME="prakken-${DEPLOY_TARGET}"
    CONTAINER_PORT="${DEPLOY_TARGET}"
    
    if [ "${DEPLOY_TARGET}" = "production" ]; then
        IMAGE_TAG="latest"
        CONTAINER_NAME="prakken-frontend"
        CONTAINER_PORT="80"
    else
        CONTAINER_PORT="3001"
    fi
    
    TEMP_TAR="${IMAGE_NAME}-${IMAGE_TAG}.tar"
    
    log_step "Deploying ${DEPLOY_TARGET} via local build..."
    log_warn "This method builds locally and transfers (legacy)"
    
    # Build locally
    log_info "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
    docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" ./frontend -f ./frontend/Dockerfile.prod
    
    # Save to tar
    log_info "Saving image to ${TEMP_TAR}"
    docker save -o "$TEMP_TAR" "${IMAGE_NAME}:${IMAGE_TAG}"
    
    # Transfer to VPS
    log_info "Transferring to ${VPS_USER}@${VPS_HOST}"
    scp "$TEMP_TAR" "${VPS_USER}@${VPS_HOST}:~/"
    
    # Deploy on VPS
    log_info "Deploying on VPS..."
    ssh "${VPS_USER}@${VPS_HOST}" bash -s << EOF
set -e

echo "=========================================="
echo "  Deploying Prakken ${DEPLOY_TARGET^}"
echo "  Method: Local Build + Transfer"
echo "=========================================="

echo "[1/5] Loading image..."
podman load -i ~/${TEMP_TAR}

echo "[2/5] Stopping existing container..."
podman rm -f ${CONTAINER_NAME} 2>/dev/null || true

echo "[3/5] Starting new container..."
podman run -d --name ${CONTAINER_NAME} \\
  --restart=always \\
  -p ${CONTAINER_PORT}:80 \\
  docker.io/library/${IMAGE_NAME}:${IMAGE_TAG}

echo "[4/5] Cleaning up..."
rm -f ~/${TEMP_TAR}

echo "[5/5] Verifying deployment..."
sleep 2
podman ps --filter name=${CONTAINER_NAME}

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
EOF
    
    # Local cleanup
    rm -f "$TEMP_TAR"
    log_info "Deployment complete!"
}

# =============================================================================
# Main
# =============================================================================
echo ""
log_step "Prakken Deployment Script"
echo "=========================================="
echo "Target: ${DEPLOY_TARGET}"
echo "Method: ${DEPLOY_METHOD}"
echo "VPS: ${VPS_USER}@${VPS_HOST}"
echo "=========================================="
echo ""

case $DEPLOY_METHOD in
    git)
        deploy_git
        ;;
    build)
        deploy_build
        ;;
    *)
        log_error "Unknown deployment method: ${DEPLOY_METHOD}"
        echo "Use --method git or --method build"
        exit 1
        ;;
esac

log_info "Done!"

