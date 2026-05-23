package app

import (
	"app_reviews_viewer/internal/api/health"
	"app_reviews_viewer/internal/api/notfound"
	"app_reviews_viewer/internal/config"
	"fmt"
	"log"
	"net/http"
)

type App struct {
	addr string
}

func New(cfg config.Settings) *App {
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)

	return &App{addr: addr}
}

func (a *App) Start() {
	port := 8080
	addr := fmt.Sprintf("localhost:%d", port)
	mux := http.NewServeMux()

	mux.HandleFunc("/api/health", health.Handler)

	// Catch not found resources
	mux.HandleFunc("/", notfound.Handler)

	log.Printf("Starting server on %s\n", addr)
	log.Fatal(http.ListenAndServe(a.addr, mux))
}
