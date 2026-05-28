package db

import (
	"database/sql"
	"errors"

	_ "github.com/mattn/go-sqlite3"
)

func Connect(dbFileName string) (*sql.DB, error) {
	if dbFileName == "" {
		return nil, errors.New("invalid DB file")
	}

	conn, err := sql.Open("sqlite3", dbFileName)
	if err != nil {
		return nil, err
	}

	return conn, nil
}
