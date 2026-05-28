package app

import (
	"app_reviews_viewer/internal/api/appreviews"
	"app_reviews_viewer/internal/api/health"
	"app_reviews_viewer/internal/api/notfound"
	"app_reviews_viewer/internal/config"
	"app_reviews_viewer/internal/db"
	"fmt"
	"log"
	"net/http"
)

type App struct {
	addr       string
	dbFileName string
}

func New(cfg config.Settings) *App {
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)

	return &App{addr: addr, dbFileName: cfg.DBFileName}
}

func (a *App) Start() {
	port := 8080
	addr := fmt.Sprintf("localhost:%d", port)
	mux := http.NewServeMux()

	mux.HandleFunc("/api/health", health.Handler)

	dbConn, err := db.Connect(a.dbFileName)
	if err != nil {
		log.Fatalf("Could not establish DB connection: %s", err)
	}
	defer dbConn.Close()

	createTablesStmt := `
	CREATE TABLE IF NOT EXISTS reviews(
		id INTEGER PRIMARY KEY,
		author TEXT NOT NULL,
		title TEXT NOT NULL,
		content TEXT,
		submitted_at DATETIME NOT NULL,
		score TEXT NOT NULL,
		app_id TEXT NOT NULL,
		external_id TEXT NOT NULL UNIQUE
	);`
	_, err = dbConn.Exec(createTablesStmt)
	if err != nil {
		log.Fatalf("Could not setup DB tables, error: %s", err)
	}

	appReviewHandler := appreviews.NewHandler(dbConn)
	mux.HandleFunc("/api/reviews/{appID}", appReviewHandler.GetAppReviews())
	mux.HandleFunc("/api/reviews/{appID}/refresh", appReviewHandler.FetchReviews())

	// Catch not found resources
	mux.HandleFunc("/", notfound.Handler)

	log.Printf("Starting server on %s\n", addr)
	log.Fatal(http.ListenAndServe(a.addr, mux))
}
