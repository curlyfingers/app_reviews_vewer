package health

import (
	"fmt"
	"net/http"
	"time"
)

// Handler is used for api health check, it returns current UTC time.
func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	data := fmt.Sprintf(`{"now": "%s"}`, time.Now().UTC())
	w.Write([]byte(data))
}
