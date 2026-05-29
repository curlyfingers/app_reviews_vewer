package appreviews

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

const (
	appIDKey   = "appID"
	reviewsKey = "reviews"
	feedKey    = "feed"
)

// Handler has all of the necessary dependencies for handling review resource.
type Handler struct {
	client *http.Client
	store  Storage
}

// NewHandler creates a new instance of Handler.
func NewHandler(dbConn *sql.DB) Handler {
	storage := NewStorage(dbConn)
	return Handler{client: &http.Client{}, store: storage}
}

// FetchReviews is used to fetch and store the most up-to-date app reviews.
func (h Handler) FetchReviews() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		appID := r.PathValue(appIDKey)
		ctx := r.Context()

		reviews, err := h.fetchReviews(ctx, appID)
		if err != nil {
			log.Default().Printf("Could not fetch app reviews, error: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		err = h.store.WriteReviews(ctx, appID, reviews)
		if err != nil {
			log.Default().Printf("Could not write reviews to store, error: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusAccepted)
	}
}

// GetAppReviews returns cached app reviews for the last 48 hours.
// If there are none in that time window it will return one review that is older.
func (h Handler) GetAppReviews() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		appID := r.PathValue(appIDKey)
		ctx := r.Context()
		reviews, err := h.store.ReadReviews(ctx, appID)
		if err != nil {
			log.Default().Printf("Could not read reviews from store, error: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if len(reviews) == 0 {
			// try refreshing reviews
			rs, err := h.fetchReviews(ctx, appID)
			if err != nil {
				w.WriteHeader(http.StatusServiceUnavailable)
				return
			}

			err = h.store.WriteReviews(ctx, appID, rs)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			reviews, err = h.store.ReadReviews(ctx, appID)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
		}

		data, err := json.Marshal(map[string][]ReviewEntry{reviewsKey: reviews})
		if err != nil {
			log.Default().Printf("Could marshal reviews response, error: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		_, err = w.Write(data)
		if err != nil {
			log.Default().Printf("Could not write app reviews response, error: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}
}

func reviewsURL(appID string, page int) string {
	return fmt.Sprintf(
		"https://itunes.apple.com/us/rss/customerreviews/id=%s/sortBy=mostRecent/page=%d/json",
		appID,
		page,
	)
}

func (h Handler) fetchReviewPage(ctx context.Context, appID string, page int) ([]ReviewEntry, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reviewsURL(appID, page), nil)
	if err != nil {
		log.Default().Printf("Could not create request, error: %s", err)
		return []ReviewEntry{}, err
	}

	resp, err := h.client.Do(req)
	if err != nil {
		log.Default().Printf("Could not fetch app reviews, error: %s", err)
		return []ReviewEntry{}, err
	}

	respBytes, err := io.ReadAll(resp.Body)
	defer resp.Body.Close()

	if err != nil {
		log.Default().Printf("Could not parse app reviews, error: %s", err)
		return []ReviewEntry{}, err
	}

	reviews, err := parseFeed(respBytes)
	if err != nil {
		log.Default().Printf("Could not parse feed, error: %s", err)
		return []ReviewEntry{}, err
	}

	return reviews, nil
}

func (h Handler) fetchReviews(ctx context.Context, appID string) ([]ReviewEntry, error) {
	page := 1
	reviews := []ReviewEntry{}
	for {
		pageReviews, err := h.fetchReviewPage(ctx, appID, page)
		if err != nil {
			return []ReviewEntry{}, err
		}
		if len(pageReviews) == 0 {
			break
		}
		reviews = append(reviews, pageReviews...)
		oldest := pageReviews[len(pageReviews)-1]
		oldestTimeStamp, err := time.Parse(time.RFC3339, oldest.SubmittedAt)
		if err != nil {
			return reviews, nil
		}
		if time.Now().Add(-48 * time.Hour).After(oldestTimeStamp) {
			break
		}
		page++
	}
	return reviews, nil
}
