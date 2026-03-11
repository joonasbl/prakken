package api

import (
	"prakken/backend/internal/database"

	"github.com/gin-gonic/gin"
)

// NewRouter creates a new Gin router with all routes configured
func NewRouter(db *database.Database) *gin.Engine {
	router := gin.Default()

	// Enable CORS for frontend
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Characters routes
	characters := router.Group("/api/characters")
	{
		characters.GET("", getCharacters(db))
		characters.GET("/:id", getCharacter(db))
		characters.POST("", createCharacter(db))
		characters.PUT("/:id", updateCharacter(db))
		characters.DELETE("/:id", deleteCharacter(db))
	}

	return router
}
