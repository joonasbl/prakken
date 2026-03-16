#!/bin/bash
#
# Deploy Prakken Frontend to VPS
# 
# This script builds the frontend Docker image, saves it to a tar file,
# transfers it to the VPS, and deploys it with Podman.
#
# Usage: ./scripts/deploy-frontend.sh [VPS_USER] [VPS_HOST]
#
# Example: ./scripts/deploy-frontend.sh opc 79.76.40.176
#

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# VPS Configuration (can be overridden via arguments)
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

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v scp &> /dev/null; then
        log_error "SCP is not available. Please install openssh-client."
        exit 1
    fi
    
    log_success "Dependencies check passed"
}

build_image() {
    log_info "Building Docker image..."
    
    cd "$FRONTEND_DIR"
    
    if [ ! -f "Dockerfile.prod" ]; then
        log_error "Dockerfile.prod not found in $FRONTEND_DIR"
        exit 1
    fi
    
    docker build -t prakken-frontend:latest -f Dockerfile.prod .
    
    log_success "Docker image built successfully"
}

save_image() {
    log_info "Saving Docker image to tar file..."
    
    cd "$FRONTEND_DIR"
    
    docker save -o prakken-frontend.tar prakken-frontend:latest
    
    TAR_SIZE=$(du -h prakken-frontend.tar | cut -f1)
    log_success "Image saved: prakken-frontend.tar ($TAR_SIZE)"
}

transfer_to_vps() {
    log_info "Transferring image to VPS ($VPS_USER@$VPS_HOST)..."
    
    cd "$FRONTEND_DIR"
    
    scp prakken-frontend.tar "$VPS_USER@$VPS_HOST:$VPS_IMAGE_PATH"
    
    log_success "Image transferred successfully"
}

cleanup_local() {
    log_info "Cleaning up local tar file..."
    
    cd "$FRONTEND_DIR"
    rm -f prakken-frontend.tar
    
    log_success "Local cleanup complete"
}

deploy_on_vps() {
    log_info "Deploying on VPS..."
    echo ""
    log_info "SSH into VPS and run the following commands:"
    echo ""
    echo "  # Stop and remove old container"
    echo "  podman stop prakken-frontend 2>/dev/null || true"
    echo "  podman rm prakken-frontend 2>/dev/null || true"
    echo ""
    echo "  # Remove old image"
    echo "  podman rmi prakken-frontend:latest 2>/dev/null || true"
    echo ""
    echo "  # Load new image"
    echo "  podman load -i $VPS_IMAGE_PATH"
    echo ""
    echo "  # Run container (HTTP only, NO SSL mounts!)"
    echo "  podman run -d --name prakken-frontend \\"
    echo "    --restart=always \\"
    echo "    -p 3000:80 \\"
    echo "    prakken-frontend:latest"
    echo ""
    echo "  # Check logs"
    echo "  podman logs -f prakken-frontend"
    echo ""
    log_info "Or run the remote-deploy script:"
    echo "  ./scripts/remote-deploy-vps.sh $VPS_USER $VPS_HOST"
    echo ""
}

verify_deployment() {
    log_info "To verify deployment, run:"
    echo ""
    echo "  curl -I http://localhost:3000"
    echo "  curl -I https://prakken.dedyn.io"
    echo ""
}

main() {
    echo ""
    echo "========================================"
    echo "  Prakken Frontend Deployment Script"
    echo "========================================"
    echo ""
    
    check_dependencies
    build_image
    save_image
    transfer_to_vps
    cleanup_local
    
    echo ""
    log_success "Build and transfer complete!"
    echo ""
    
    deploy_on_vps
    verify_deployment
    
    echo ""
    log_info "Done!"
    echo ""
}

# Run main function
main "$@"
