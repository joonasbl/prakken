#!/bin/bash
#
# Remote Deploy Prakken Frontend on VPS
#
# This script SSHs into the VPS and deploys the frontend container.
# Run this AFTER running deploy-frontend.sh to transfer the image.
#
# Usage: ./scripts/remote-deploy-vps.sh [VPS_USER] [VPS_HOST]
#
# Example: ./scripts/remote-deploy-vps.sh opc 79.76.40.176
#

set -e  # Exit on error

# Configuration
VPS_USER="${1:-opc}"
VPS_HOST="${2:-79.76.40.176}"
VPS_IMAGE_PATH="/tmp/prakken-frontend.tar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_ssh() {
    log_info "Testing SSH connection to $VPS_USER@$VPS_HOST..."
    
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'Connection successful'" &> /dev/null; then
        log_error "Cannot connect to VPS via SSH."
        log_info "Make sure:"
        echo "  1. SSH key is set up (ssh-copy-id $VPS_USER@$VPS_HOST)"
        echo "  2. VPS is accessible"
        echo "  3. SSH agent is running (eval \"\$(ssh-agent -s)\" && ssh-add)"
        exit 1
    fi
    
    log_success "SSH connection verified"
}

deploy_on_vps() {
    log_info "Deploying on VPS..."
    echo ""
    
    ssh "$VPS_USER@$VPS_HOST" << 'ENDSSH'
set -e

echo "=========================================="
echo "  Deploying Prakken Frontend"
echo "=========================================="
echo ""

# Stop and remove old container
echo "[1/6] Stopping old container..."
podman stop prakken-frontend 2>/dev/null || true
podman rm prakken-frontend 2>/dev/null || true

# Remove old image
echo "[2/6] Removing old image..."
podman rmi prakken-frontend:latest 2>/dev/null || true

# Load new image
echo "[3/6] Loading new image..."
if [ ! -f /tmp/prakken-frontend.tar ]; then
    echo "ERROR: Image file not found at /tmp/prakken-frontend.tar"
    echo "Run ./scripts/deploy-frontend.sh first to transfer the image."
    exit 1
fi
podman load -i /tmp/prakken-frontend.tar

# Run container
echo "[4/6] Starting new container..."
podman run -d --name prakken-frontend \
  --restart=always \
  -p 3000:80 \
  prakken-frontend:latest

# Wait for container to start
echo "[5/6] Waiting for container to start..."
sleep 2

# Check status
echo "[6/6] Checking container status..."
podman ps --filter name=prakken-frontend

echo ""
echo "=========================================="
echo "  Container Logs (last 20 lines)"
echo "=========================================="
podman logs --tail 20 prakken-frontend

echo ""
echo "=========================================="
echo "  Testing Local Connection"
echo "=========================================="
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✓ Container is responding on port 3000"
else
    echo "⚠ Container may not be ready yet. Check logs above."
fi

echo ""
echo "=========================================="
echo "  Cleanup"
echo "=========================================="
rm -f /tmp/prakken-frontend.tar
echo "✓ Cleaned up tar file"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Test your site:"
echo "  - Local:  http://localhost:3000"
echo "  - HTTPS:  https://prakken.dedyn.io"
echo ""
ENDSSH
}

verify_https() {
    log_info "Verifying HTTPS connection..."
    echo ""
    
    if curl -s -o /dev/null -w "%{http_code}" https://prakken.dedyn.io | grep -q "200"; then
        log_success "HTTPS is working!"
    else
        log_warning "HTTPS may not be ready yet. Check Caddy logs:"
        echo "  podman logs caddy"
    fi
    
    echo ""
}

main() {
    echo ""
    echo "========================================"
    echo "  Prakken Remote Deployment"
    echo "========================================"
    echo ""
    
    check_ssh
    deploy_on_vps
    verify_https
    
    log_success "Deployment complete!"
    echo ""
}

# Run main function
main "$@"
