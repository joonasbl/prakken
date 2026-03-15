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
