package database

import (
	"database/sql"
	"fmt"
	"math/rand"
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
		// Shopping tables
		`CREATE TABLE IF NOT EXISTS shopping_categories (
			id VARCHAR(100) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS shopping_items (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			category_id VARCHAR(100) REFERENCES shopping_categories(id) ON DELETE SET NULL,
			base_price INTEGER NOT NULL DEFAULT 0,
			price_formula VARCHAR(50) NOT NULL DEFAULT '10+3d6',
			current_price INTEGER NOT NULL,
			availability_chance INTEGER NOT NULL DEFAULT 50,
			is_available BOOLEAN DEFAULT true,
			last_rolled_at TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE INDEX IF NOT EXISTS idx_attributes_character ON attributes(character_id)`,
		`CREATE INDEX IF NOT EXISTS idx_skills_character ON skills(character_id)`,
		`CREATE INDEX IF NOT EXISTS idx_advantages_character ON advantages(character_id)`,
		`CREATE INDEX IF NOT EXISTS idx_disadvantages_character ON disadvantages(character_id)`,
		`CREATE INDEX IF NOT EXISTS idx_equipment_character ON equipment(character_id)`,
		`CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON shopping_items(category_id)`,
		`CREATE INDEX IF NOT EXISTS idx_shopping_items_available ON shopping_items(is_available)`,
	}

	for _, migration := range migrations {
		if _, err := d.conn.Exec(migration); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	// Seed initial data
	if err := d.Seed(); err != nil {
		return fmt.Errorf("seeding failed: %w", err)
	}

	return nil
}

// Seed inserts initial data if tables are empty
func (d *Database) Seed() error {
	// Check if categories already exist
	var count int
	err := d.conn.QueryRow("SELECT COUNT(*) FROM shopping_categories").Scan(&count)
	if err != nil {
		return err
	}

	// Only seed if tables are empty
	if count == 0 {
		// Insert categories
		categories := []struct {
			id, name, description string
		}{
			{"velhojen-liemet", "Velhojen liemet", "Taikajuomat ja potionit"},
			{"alkemistien-keitokset", "Alkemistien keitokset", "Alkemistien valmistamat erikoisjuomat ja aineet"},
			{"yrtit-ja-yrttiseokset", "Yrtit ja yrttiseokset", "Kuivatut yrtit ja valmiit seokset"},
			{"erikoismateriaalit", "Erikoismateriaalit", "Harvinaiset materiaalit ja ainekset"},
		}

		for _, cat := range categories {
			_, err := d.conn.Exec(
				`INSERT INTO shopping_categories (id, name, description) VALUES ($1, $2, $3)`,
				cat.id, cat.name, cat.description,
			)
			if err != nil {
				return err
			}
		}

		// Insert items
		items := []struct {
			name, description, categoryID, priceFormula string
			basePrice, availabilityChance               int
		}{
			// Velhojen liemet
			{"Parantava juoma", "Palauttaa 1d6 veripistettä välittömästi.", "velhojen-liemet", "10+3d6", 10, 80},
			{"Suuri parantava juoma", "Palauttaa 3d6 veripistettä välittömästi.", "velhojen-liemet", "30+6d6", 30, 50},
			{"Myrkynvastus", "Antaa +2 bonuksen myrkkyjen vastustamiseen 1 tunnin ajaksi.", "velhojen-liemet", "15+2d10", 15, 60},
			{"Näkemisen juoma", "Mahdollistaa näkemisen pimeässä 1 tunnin ajaksi.", "velhojen-liemet", "20+4d6", 20, 40},
			{"Nopeuden juoma", "Antaa +2 bonuksen Ketteryystarkistuksiin 10 minuutin ajaksi.", "velhojen-liemet", "25+3d8", 25, 35},
			{"Voiman juoma", "Antaa +2 bonuksen Voimatarkistuksiin 10 minuutin ajaksi.", "velhojen-liemet", "25+3d8", 25, 35},
			{"Näkymättömyysjuoma", "Tekee juojasta näkymättömän 1d6 kierroksen ajaksi.", "velhojen-liemet", "50+10d6", 50, 20},
			{"Lennon juoma", "Mahdollistaa lentämisen 10 minuutin ajaksi.", "velhojen-liemet", "40+8d6", 40, 25},

			// Alkemistien keitokset
			{"Alkemistinen happo", "Syövyttävää nestettä. Aiheuttaa 2d6 vahinkoa osumasta.", "alkemistien-keitokset", "15+3d6", 15, 70},
			{"Pallopullo", "Räjähtää osuessaan, aiheuttaen 1d6 tulivahinkoa alueelle.", "alkemistien-keitokset", "20+4d6", 20, 60},
			{"Savupullo", "Luo 5 metrin säteisen savuverhon 1d6 kierrokseksi.", "alkemistien-keitokset", "12+2d6", 12, 75},
			{"Liimapullo", "Sitoo kohteen paikoilleen 1d6 kierrokseksi (Voima-vastustus).", "alkemistien-keitokset", "18+3d8", 18, 55},
			{"Öljypullo", "Leviää 3 metrin alueelle, syttyy tulesta.", "alkemistien-keitokset", "8+2d6", 8, 85},
			{"Kirkasmielisyysjuoma", "Poistaa sekasorron ja pelon vaikutukset.", "alkemistien-keitokset", "22+4d6", 22, 45},

			// Yrtit
			{"Kuivattu auringonkukka", "Käytetään parantavien juomien valmistukseen.", "yrtit-ja-yrttiseokset", "5+1d6", 5, 90},
			{"Yövarjo", "Myrkyllinen kasvi. Käytetään myrkkyjen valmistukseen.", "yrtit-ja-yrttiseokset", "8+2d6", 8, 50},
			{"Hopealehti", "Harvinainen yrtti. Käytetään suojausrituaaleissa.", "yrtit-ja-yrttiseokset", "15+3d6", 15, 30},
			{"Parantava yrttiseos", "Valmis seos haavojen hoitoon. Palauttaa 1d4 hp.", "yrtit-ja-yrttiseokset", "10+2d6", 10, 70},

			// Erikoismateriaalit
			{"Lohikäärmeen kyynel", "Erittäin harvinainen. Vahvistaa taikajuomia huomattavasti.", "erikoismateriaalit", "100+20d6", 100, 10},
			{"Yksisarvisen karva", "Käytetään erityisen voimakkaiden parannusjuomien valmistukseen.", "erikoismateriaalit", "80+15d6", 80, 15},
			{"Feniksin tuhka", "Uudelleensyntymisen voimaa sisältävä tuhka.", "erikoismateriaalit", "150+25d6", 150, 5},
			{"Kuunvalo-uute", "Kerätty täysikuun yönä. Käytetään näkymättömyysjuomiin.", "erikoismateriaalit", "35+8d6", 35, 25},
		}

		now := time.Now()
		for _, item := range items {
			// Roll initial price
			currentPrice := rollPrice(item.priceFormula)
			// Roll initial availability
			isAvailable := rollAvailability(item.availabilityChance)

			_, err := d.conn.Exec(
				`INSERT INTO shopping_items 
				(name, description, category_id, base_price, price_formula, current_price, availability_chance, is_available, last_rolled_at, created_at, updated_at) 
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
				item.name, item.description, item.categoryID, item.basePrice, item.priceFormula,
				currentPrice, item.availabilityChance, isAvailable, now, now, now,
			)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

// rollPrice rolls a price formula like "10+3d6"
func rollPrice(formula string) int {
	// Simple parser for formulas like "10+3d6"
	var base, diceCount, diceSides int
	fmt.Sscanf(formula, "%d+%dd%d", &base, &diceCount, &diceSides)

	total := base
	for i := 0; i < diceCount; i++ {
		total += rand.Intn(diceSides) + 1
	}
	return total
}

// rollAvailability rolls a percentage chance
func rollAvailability(chance int) bool {
	return rand.Intn(100) < chance
}

// Conn returns the underlying SQL connection
func (d *Database) Conn() *sql.DB {
	return d.conn
}
