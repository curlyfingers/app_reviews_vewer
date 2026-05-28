package appreviews

import (
	"encoding/json"
)

type feedContainer struct {
	Feed feed `json:"feed"`
}

type feed struct {
	Entries []entry `json:"entry"`
}

type entry struct {
	Author  entryAuthor `json:"author"`
	Updated label       `json:"updated"`
	Rating  label       `json:"im:rating"`
	ID      label       `json:"id"`
	Title   label       `json:"title"`
	Content content     `json:"content"`
}

type entryAuthor struct {
	Name label `json:"name"`
}

type content struct {
	Label string `json:"label"`
}

type label struct {
	Label string `json:"label"`
}

func parseFeed(data []byte) ([]ReviewEntry, error) {
	wrapped := feedContainer{}
	err := json.Unmarshal(data, &wrapped)
	if err != nil {
		return []ReviewEntry{}, err
	}

	result := make([]ReviewEntry, 0, len(wrapped.Feed.Entries))
	for _, e := range wrapped.Feed.Entries {
		review := ReviewEntry{
			Author:      e.Author.Name.Label,
			Title:       e.Title.Label,
			Content:     e.Content.Label,
			SubmittedAt: e.Updated.Label,
			Score:       e.Rating.Label,
			ExternalID:  e.ID.Label,
		}
		result = append(result, review)
	}
	return result, nil
}
