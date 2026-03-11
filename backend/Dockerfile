FROM golang:1.25-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum* ./

# Download dependencies
RUN go mod download || true

# Copy source code
COPY . .

# Build the application
RUN go build -o main cmd/main.go

# Expose port
EXPOSE 8080

# Run the application
CMD ["./main"]
