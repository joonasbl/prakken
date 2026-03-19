package api

import (
	"database/sql"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"prakken/backend/internal/database"

	"github.com/gin-gonic/gin"
)

// ShoppingCategory represents a shopping category
type ShoppingCategory struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// ShoppingItem represents a shopping item
type ShoppingItem struct {
	ID                 int       `json:"id"`
	Name               string    `json:"name"`
	Description        string    `json:"description"`
	CategoryID         string    `json:"categoryId"`
	BasePrice          int       `json:"basePrice"`
	PriceFormula       string    `json:"priceFormula"`
	CurrentPrice       int       `json:"currentPrice"`
	AvailabilityChance int       `json:"availabilityChance"`
	IsAvailable        bool      `json:"isAvailable"`
	LastRolledAt       time.Time `json:"lastRolledAt"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

// getCategories returns all shopping categories
func getCategories(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Conn().Query("SELECT id, name, description, created_at, updated_at FROM shopping_categories ORDER BY name")
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch categories"})
			return
		}
		defer rows.Close()

		categories := []ShoppingCategory{}
		for rows.Next() {
			var cat ShoppingCategory
			if err := rows.Scan(&cat.ID, &cat.Name, &cat.Description, &cat.CreatedAt, &cat.UpdatedAt); err != nil {
				continue
			}
			categories = append(categories, cat)
		}

		c.JSON(200, categories)
	}
}

// getItems returns all shopping items (optionally filtered by availability)
func getItems(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		availableOnly := c.DefaultQuery("available", "false") == "true"

		var rows *sql.Rows
		var err error

		if availableOnly {
			rows, err = db.Conn().Query(`
				SELECT id, name, description, category_id, base_price, price_formula, 
				       current_price, availability_chance, is_available, 
				       last_rolled_at, created_at, updated_at 
				FROM shopping_items 
				WHERE is_available = true 
				ORDER BY name
			`)
		} else {
			rows, err = db.Conn().Query(`
				SELECT id, name, description, category_id, base_price, price_formula, 
				       current_price, availability_chance, is_available, 
				       last_rolled_at, created_at, updated_at 
				FROM shopping_items 
				ORDER BY name
			`)
		}

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch items"})
			return
		}
		defer rows.Close()

		items := []ShoppingItem{}
		for rows.Next() {
			var item ShoppingItem
			var lastRolledAt sql.NullTime
			if err := rows.Scan(
				&item.ID, &item.Name, &item.Description, &item.CategoryID,
				&item.BasePrice, &item.PriceFormula, &item.CurrentPrice,
				&item.AvailabilityChance, &item.IsAvailable, &lastRolledAt,
				&item.CreatedAt, &item.UpdatedAt,
			); err != nil {
				continue
			}
			if lastRolledAt.Valid {
				item.LastRolledAt = lastRolledAt.Time
			}
			items = append(items, item)
		}

		c.JSON(200, items)
	}
}

// getItem returns a single shopping item by ID
func getItem(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		itemID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid item ID"})
			return
		}

		var item ShoppingItem
		var lastRolledAt sql.NullTime
		err = db.Conn().QueryRow(`
			SELECT id, name, description, category_id, base_price, price_formula, 
			       current_price, availability_chance, is_available, 
			       last_rolled_at, created_at, updated_at 
			FROM shopping_items WHERE id = $1
		`, itemID).Scan(
			&item.ID, &item.Name, &item.Description, &item.CategoryID,
			&item.BasePrice, &item.PriceFormula, &item.CurrentPrice,
			&item.AvailabilityChance, &item.IsAvailable, &lastRolledAt,
			&item.CreatedAt, &item.UpdatedAt,
		)

		if err != nil {
			c.JSON(404, gin.H{"error": "Item not found"})
			return
		}

		if lastRolledAt.Valid {
			item.LastRolledAt = lastRolledAt.Time
		}

		c.JSON(200, item)
	}
}

// createItem creates a new shopping item
func createItem(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var item ShoppingItem
		if err := c.ShouldBindJSON(&item); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		// Roll initial price and availability
		currentPrice := rollPrice(item.PriceFormula)
		isAvailable := rollAvailability(item.AvailabilityChance)
		now := time.Now()

		var id int
		err := db.Conn().QueryRow(`
			INSERT INTO shopping_items 
			(name, description, category_id, base_price, price_formula, current_price, 
			 availability_chance, is_available, last_rolled_at, created_at, updated_at) 
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
			RETURNING id
		`, item.Name, item.Description, item.CategoryID, item.BasePrice, item.PriceFormula,
			currentPrice, item.AvailabilityChance, isAvailable, now, now, now,
		).Scan(&id)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create item"})
			return
		}

		item.ID = id
		item.CurrentPrice = currentPrice
		item.IsAvailable = isAvailable
		item.LastRolledAt = now
		item.CreatedAt = now
		item.UpdatedAt = now

		c.JSON(201, item)
	}
}

// updateItem updates an existing shopping item
func updateItem(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		itemID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid item ID"})
			return
		}

		var item ShoppingItem
		if err := c.ShouldBindJSON(&item); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		_, err = db.Conn().Exec(`
			UPDATE shopping_items 
			SET name = $1, description = $2, category_id = $3, base_price = $4, 
			    price_formula = $5, availability_chance = $6, updated_at = CURRENT_TIMESTAMP 
			WHERE id = $7
		`, item.Name, item.Description, item.CategoryID, item.BasePrice,
			item.PriceFormula, item.AvailabilityChance, itemID,
		)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to update item"})
			return
		}

		item.ID = itemID
		item.UpdatedAt = time.Now()
		c.JSON(200, item)
	}
}

// deleteItem deletes a shopping item
func deleteItem(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		itemID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid item ID"})
			return
		}

		_, err = db.Conn().Exec("DELETE FROM shopping_items WHERE id = $1", itemID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to delete item"})
			return
		}

		c.JSON(200, gin.H{"message": "Item deleted"})
	}
}

// rerollItemPrice rerolls the price for an item
func rerollItemPrice(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		itemID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid item ID"})
			return
		}

		// Get current price formula
		var priceFormula string
		err = db.Conn().QueryRow("SELECT price_formula FROM shopping_items WHERE id = $1", itemID).Scan(&priceFormula)
		if err != nil {
			c.JSON(404, gin.H{"error": "Item not found"})
			return
		}

		newPrice := rollPrice(priceFormula)
		now := time.Now()

		_, err = db.Conn().Exec(`
			UPDATE shopping_items 
			SET current_price = $1, last_rolled_at = $2, updated_at = $3 
			WHERE id = $4
		`, newPrice, now, now, itemID)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to reroll price"})
			return
		}

		c.JSON(200, gin.H{"currentPrice": newPrice, "lastRolledAt": now})
	}
}

// rerollItemAvailability rerolls the availability for an item
func rerollItemAvailability(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		itemID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid item ID"})
			return
		}

		// Get current availability chance
		var availabilityChance int
		err = db.Conn().QueryRow("SELECT availability_chance FROM shopping_items WHERE id = $1", itemID).Scan(&availabilityChance)
		if err != nil {
			c.JSON(404, gin.H{"error": "Item not found"})
			return
		}

		isAvailable := rollAvailability(availabilityChance)
		now := time.Now()

		_, err = db.Conn().Exec(`
			UPDATE shopping_items 
			SET is_available = $1, last_rolled_at = $2, updated_at = $3 
			WHERE id = $4
		`, isAvailable, now, now, itemID)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to reroll availability"})
			return
		}

		c.JSON(200, gin.H{"isAvailable": isAvailable, "lastRolledAt": now})
	}
}

// updateItemPrice manually updates an item's price
func updateItemPrice(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		itemID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid item ID"})
			return
		}

		var body struct {
			Price int `json:"price"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		now := time.Now()
		_, err = db.Conn().Exec(`
			UPDATE shopping_items 
			SET current_price = $1, last_rolled_at = $2, updated_at = $3 
			WHERE id = $4
		`, body.Price, now, now, itemID)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to update price"})
			return
		}

		c.JSON(200, gin.H{"currentPrice": body.Price, "lastRolledAt": now})
	}
}

// toggleItemAvailability toggles an item's availability
func toggleItemAvailability(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		itemID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid item ID"})
			return
		}

		now := time.Now()
		_, err = db.Conn().Exec(`
			UPDATE shopping_items 
			SET is_available = NOT is_available, last_rolled_at = $1, updated_at = $2 
			WHERE id = $3
		`, now, now, itemID)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to toggle availability"})
			return
		}

		// Get new availability status
		var isAvailable bool
		err = db.Conn().QueryRow("SELECT is_available FROM shopping_items WHERE id = $1", itemID).Scan(&isAvailable)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to get new status"})
			return
		}

		c.JSON(200, gin.H{"isAvailable": isAvailable, "lastRolledAt": now})
	}
}

// rerollAll rerolls prices and availability for all items
func rerollAll(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Conn().Query("SELECT id, price_formula, availability_chance FROM shopping_items")
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch items"})
			return
		}
		defer rows.Close()

		now := time.Now()
		count := 0

		for rows.Next() {
			var itemID int
			var priceFormula string
			var availabilityChance int

			if err := rows.Scan(&itemID, &priceFormula, &availabilityChance); err != nil {
				continue
			}

			newPrice := rollPrice(priceFormula)
			isAvailable := rollAvailability(availabilityChance)

			_, err = db.Conn().Exec(`
				UPDATE shopping_items 
				SET current_price = $1, is_available = $2, last_rolled_at = $3, updated_at = $4 
				WHERE id = $5
			`, newPrice, isAvailable, now, now, itemID)

			if err == nil {
				count++
			}
		}

		c.JSON(200, gin.H{"count": count, "lastRolledAt": now})
	}
}

// rollPrice rolls a price formula like "10+3d6"
func rollPrice(formula string) int {
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
