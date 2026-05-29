package appreviews

// ReviewEntry holds all relevant data for an app review.
type ReviewEntry struct {
	Author      string `json:"author"`
	Title       string `json:"title"`
	Content     string `json:"content,omitempty"`
	Score       string `json:"score"`
	SubmittedAt string `json:"submitted_at"`
	ExternalID  string `json:"external_id,omitempty"`
}
