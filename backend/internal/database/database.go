package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

// Database wraps the SQL connection pool
type Database struct {
	conn *sql.DB
}

// NewDatabase creates a new database connection
func NewDatabase(dataSourceName string) (*Database, error) {
	
	db, err := sql.Open("postgres", dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Verify connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Database{conn: db}, nil
}

// Close closes the database connection
func (d *Database) Close() error {
	return d.conn.Close()
}

// Migrate runs database migrations
func (d *Database) Migrate() error {
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS characters (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			background VARCHAR(100),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS attributes (
			id SERIAL PRIMARY KEY,
			character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
			name VARCHAR(50) NOT NULL,
			value INTEGER NOT NULL DEFAULT 10
		)`,
		`CREATE TABLE IF NOT EXISTS skills (
			id SERIAL PRIMARY KEY,
			character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL,
			bonus INTEGER NOT NULL DEFAULT 0,
			learned BOOLEAN DEFAULT false
		)`,
		`CREATE TABLE IF NOT EXISTS advantages (
			id SERIAL PRIMARY KEY,
			character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS disadvantages (
			id SERIAL PRIMARY KEY,
			character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS equipment (
			id SERIAL PRIMARY KEY,
			character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
			name VARCHAR(255) NOT NULL,
			weight DECIMAL(5,2),
			cost INTEGER
		)`,
		`CREATE INDEX IF NOT EXISTS idx_attributes_character ON attributes(character_id)`,
		`CREATE INDEX IF NOT EXISTS idx_skills_character ON skills(character_id)`,
		`CREATE INDEX IF NOT EXISTS idx_advantages_character ON advantages(character_id)`,
		`CREATE INDEX IF NOT EXISTS idx_disadvantages_character ON disadvantages(character_id)`,
		`CREATE INDEX IF NOT EXISTS idx_equipment_character ON equipment(character_id)`,
	}

	for _, migration := range migrations {
		if _, err := d.conn.Exec(migration); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	return nil
}

// Conn returns the underlying SQL connection
func (d *Database) Conn() *sql.DB {
	return d.conn
}
