package main

import (
	"log"

	"app_reviews_viewer/internal/app"
	"app_reviews_viewer/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Could not load necessary configs: %s", err)
		return
	}

	server := app.New(cfg)
	server.Start()
}
