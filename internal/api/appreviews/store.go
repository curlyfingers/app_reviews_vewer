package appreviews

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Storage struct {
	db *sql.DB
}

func NewStorage(db *sql.DB) Storage {
	return Storage{db: db}
}

func (s Storage) WriteReviews(ctx context.Context, appID string, data []ReviewEntry) error {
	valuesStr := make([]string, 0, len(data))
	valuesArgs := make([]any, 0, len(data)*7)
	for _, entry := range data {
		valuesStr = append(valuesStr, "(?, ?, ?, ?, ?, ?, ?)")
		valuesArgs = append(valuesArgs,
			entry.Title,
			entry.Author,
			entry.Content,
			entry.Score,
			entry.SubmittedAt,
			appID,
			entry.ExternalID,
		)
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = s.db.ExecContext(ctx, `DELETE FROM reviews WHERE app_id=?`, appID)
	if err != nil {
		return err
	}

	stmt := fmt.Sprintf("INSERT INTO reviews(title, author, content, score, submitted_at, app_id, external_id) VALUES %s", strings.Join(valuesStr, ","))
	_, err = s.db.ExecContext(ctx, stmt, valuesArgs...)
	if err != nil {
		return err
	}
	tx.Commit()

	return nil
}

func (s Storage) ReadReviews(ctx context.Context, appID string) ([]ReviewEntry, error) {
	stmt := `
	SELECT title, content, author, score, submitted_at
	FROM reviews
	WHERE app_id=?
	ORDER BY submitted_at DESC
	`
	rows, err := s.db.QueryContext(ctx, stmt, appID)
	if err != nil {
		return []ReviewEntry{}, err
	}

	twoDaysAgo := time.Now().Add(-48 * time.Hour)
	reviews := []ReviewEntry{}
	for {
		if !rows.Next() {
			break
		}
		review := ReviewEntry{}
		err = rows.Scan(&review.Title, &review.Content, &review.Author, &review.Score, &review.SubmittedAt)
		if err != nil {
			return []ReviewEntry{}, err
		}

		timestamp, _ := time.Parse(time.RFC3339, review.SubmittedAt)
		if len(reviews) > 0 && timestamp.Before(twoDaysAgo) {
			break
		}

		reviews = append(reviews, review)
	}

	return reviews, nil
}
