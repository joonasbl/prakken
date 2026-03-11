package api

import (
	"database/sql"
	"strconv"

	"prakken/backend/internal/database"

	"github.com/gin-gonic/gin"
)

// Character represents a character in the database
type Character struct {
	ID       int                    `json:"id"`
	Name     string                 `json:"name"`
	Background string               `json:"background,omitempty"`
	Attributes []Attribute          `json:"attributes"`
	Skills     []Skill              `json:"skills"`
	Advantages []string             `json:"advantages"`
	Disadvantages []string          `json:"disadvantages"`
	Equipment  []Equipment          `json:"equipment"`
}

type Attribute struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type Skill struct {
	Name   string `json:"name"`
	Bonus  int    `json:"bonus"`
	Learned bool  `json:"learned"`
}

type Equipment struct {
	Name   string  `json:"name"`
	Weight float64 `json:"weight"`
	Cost   int     `json:"cost"`
}

// getCharacters returns all characters
func getCharacters(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Conn().Query("SELECT id, name, background FROM characters ORDER BY updated_at DESC")
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch characters"})
			return
		}
		defer rows.Close()

		characters := []Character{}
		for rows.Next() {
			var char Character
			var background sql.NullString
			if err := rows.Scan(&char.ID, &char.Name, &background); err != nil {
				continue
			}
			if background.Valid {
				char.Background = background.String
			}
			characters = append(characters, char)
		}

		c.JSON(200, characters)
	}
}

// getCharacter returns a single character by ID
func getCharacter(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		charID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid character ID"})
			return
		}

		var char Character
		var background sql.NullString
		err = db.Conn().QueryRow("SELECT id, name, background FROM characters WHERE id = $1", charID).
			Scan(&char.ID, &char.Name, &background)
		if err != nil {
			c.JSON(404, gin.H{"error": "Character not found"})
			return
		}
		if background.Valid {
			char.Background = background.String
		}

		// Load attributes
		attrRows, _ := db.Conn().Query("SELECT name, value FROM attributes WHERE character_id = $1", charID)
		defer attrRows.Close()
		for attrRows.Next() {
			var attr Attribute
			attrRows.Scan(&attr.Name, &attr.Value)
			char.Attributes = append(char.Attributes, attr)
		}

		c.JSON(200, char)
	}
}

// createCharacter creates a new character
func createCharacter(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var char Character
		if err := c.ShouldBindJSON(&char); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		var id int
		err := db.Conn().QueryRow(
			"INSERT INTO characters (name, background) VALUES ($1, $2) RETURNING id",
			char.Name, char.Background,
		).Scan(&id)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create character"})
			return
		}

		char.ID = id
		c.JSON(201, char)
	}
}

// updateCharacter updates an existing character
func updateCharacter(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		charID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid character ID"})
			return
		}

		var char Character
		if err := c.ShouldBindJSON(&char); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		_, err = db.Conn().Exec(
			"UPDATE characters SET name = $1, background = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
			char.Name, char.Background, charID,
		)

		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to update character"})
			return
		}

		c.JSON(200, char)
	}
}

// deleteCharacter deletes a character
func deleteCharacter(db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		charID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid character ID"})
			return
		}

		_, err = db.Conn().Exec("DELETE FROM characters WHERE id = $1", charID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to delete character"})
			return
		}

		c.JSON(200, gin.H{"message": "Character deleted"})
	}
}
