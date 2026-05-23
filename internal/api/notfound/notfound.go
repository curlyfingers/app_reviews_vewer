package notfound

import (
	"net/http"
)

// Handler is used to catch non registered routes and will return 404.
// If root is accessed it returns 204.
func Handler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
