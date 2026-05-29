# App Review Viewer  

## About

This application is used to fetch and display app reviews from [iTunes App Reviews RSS](https://itunes.apple.com/us/rss/customerreviews/). It consists of two components:
1) API written in Go and using SQLite(app_reviews.db) to cache reviews for the last 48 hours.
2) Frontend client using React

## Running locally

1) Copy and rename app_reviews.db.sample => app_reviews.db
```sh
  cp app_reviews.db.sample app_reviews.db
```

2) Install dependencies
```sh
  go mod download && cd app_reviews && npm i && cd ..
```

3) Start API
```sh
  go run cmd/main.go
```

4) Start React Client
```sh
  npm run dev
```
API will be reachable at `localhost:8080`. It has the following endpoints:
* GET /api/health - It returns current timestamp and is used to check API's health.
* GET /api/reviews/{app_id} - Returns a list of reviews for App with id *app_id* wrapped in `reviews` key.
* POST /api/reviews/{app_id}/refresh - Refreshes local app review cache with entries from iTunes RSS feed.

UI Client will be reachable on `localhost:5173` and presents a simple interface with a text field for App ID. Upon clicking fetch button it will load app reviews.
