package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
)

type StockResponse struct {
	BookID string `json:"bookId"`
	Stock  int    `json:"stock"`
}

type ChangeRequest struct {
	Change int `json:"change"`
}

var (
	stock = map[string]int{}
	mu    sync.RWMutex
)

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}

func health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "inventory-service"})
}

func getStock(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/stock/"):]
	mu.RLock()
	val := stock[id]
	mu.RUnlock()
	writeJSON(w, http.StatusOK, StockResponse{BookID: id, Stock: val})
}

func updateStock(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/stock/"):]
	var req ChangeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	mu.Lock()
	stock[id] = stock[id] + req.Change
	val := stock[id]
	mu.Unlock()
	writeJSON(w, http.StatusOK, StockResponse{BookID: id, Stock: val})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3004"
	}

	http.HandleFunc("/health", health)
	http.HandleFunc("/stock/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			getStock(w, r)
		case http.MethodPost:
			updateStock(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	log.Printf("inventory-service listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}