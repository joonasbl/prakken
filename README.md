# Prakken

A fantasy character management system for tabletop RPGs, built with Vue 3 and Go.

## Project Structure

```
Prakken/
├── backend/            # Go (Golang) Source Code
│   ├── cmd/            # Main entry points (main.go)
│   ├── internal/       # Private library code (DB logic, RPG rules)
│   ├── api/            # Gin routes & handlers
│   └── go.mod
├── frontend/           # Vue 3 Source Code
│   ├── src/
│   ├── public/
│   └── package.json
├── docker-compose.yml  # Spins up Go, Vue, and PostgreSQL
└── README.md
```

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Go backend, Vue frontend)
docker-compose up -d

# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
# Database: localhost:5432

# Stop all services
docker-compose down
```

### Development Without Docker

#### Backend (Go)

```bash
cd backend

# Install dependencies
go mod download

# Run the server
go run cmd/main.go

# Server runs on http://localhost:8080
```

#### Frontend (Vue 3)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Frontend runs on http://localhost:5173
```

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Pinia, Vue Router, Vite
- **Backend**: Go 1.21, Gin Framework
- **Database**: PostgreSQL 15
- **Styling**: Custom fantasy dark theme with CSS

## API Endpoints

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| GET    | `/health`             | Health check         |
| GET    | `/api/characters`     | List all characters  |
| GET    | `/api/characters/:id` | Get character by ID  |
| POST   | `/api/characters`     | Create new character |
| PUT    | `/api/characters/:id` | Update character     |
| DELETE | `/api/characters/:id` | Delete character     |

## Deployment

### Production Deployment

The application is deployed to a VPS using Podman with Caddy as a reverse proxy for automatic SSL.

#### Deploy to Production

```bash
# From project root
./deploy.sh
```

This will:
1. Build the Docker image locally
2. Transfer to VPS via SCP
3. Deploy with Podman on port 3000
4. Caddy handles SSL automatically

**Production URL:** https://prakken.dedyn.io

#### Deploy to Test Environment

```bash
# Deploy to test subdomain
./deploy.sh test

# Deploy specific version to test
./deploy.sh test --tag v1.4.0
```

**Test URL:** https://test.prakken.dedyn.io

### Configuration

The deployment script uses these environment variables (with defaults):

```bash
VPS_USER=opc              # VPS username
VPS_HOST=prakken.dedyn.io # VPS hostname/IP
IMAGE_NAME=prakken-frontend
```

Override as needed:

```bash
VPS_USER=myuser VPS_HOST=mydomain.com ./deploy.sh
```

### CI/CD with GitHub Actions

The application automatically deploys when you push a version tag:

```bash
# Create and push a version tag
git tag -a v1.4.0 -m "Release v1.4.0"
git push origin v1.4.0
```

GitHub Actions will:
1. Run tests, type-check, and lint
2. Build the Docker image
3. Create a GitHub release
4. Deploy to VPS
5. Verify the deployment

**Workflow:** `.github/workflows/deploy.yml`

### Managing Containers on VPS

```bash
# SSH to VPS
ssh opc@prakken.dedyn.io

# List containers
podman ps | grep prakken

# View logs
podman logs -f prakken-frontend    # Production
podman logs -f prakken-test        # Test
podman logs -f caddy              # SSL/Reverse proxy

# Restart containers
podman restart prakken-frontend
podman restart prakken-test
podman restart caddy
```

### Caddy Configuration

Caddy handles SSL termination and reverse proxying. Configuration is at `/opt/caddy/Caddyfile`:

```caddy
prakken.dedyn.io {
    reverse_proxy localhost:3000
}

test.prakken.dedyn.io {
    reverse_proxy localhost:3001
}
```

Caddy automatically obtains and renews Let's Encrypt SSL certificates.

---

## Development

### Backend Commands

```bash
cd backend

# Run tests
go test ./...

# Build
go build -o main cmd/main.go

# Run
./main
```

### Frontend Commands

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Database Schema

The application uses PostgreSQL with the following tables:

- `characters` - Character basic info (name, background)
- `attributes` - Character attributes (Voima, Terveys, etc.)
- `skills` - Character skills with bonuses
- `advantages` - Character advantages
- `disadvantages` - Character disadvantages
- `equipment` - Character equipment items

## License

MIT
