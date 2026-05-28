package appreviews

type ReviewEntry struct {
	Author      string `json:"author"`
	Title       string `json:"title"`
	Content     string `json:"content,omitempty"`
	Score       string `json:"score"`
	SubmittedAt string `json:"submitted_at"`
	ExternalID  string `json:"external_id,omitempty"`
}
