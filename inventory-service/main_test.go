package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

type stockResp struct {
	BookID string `json:"bookId"`
	Stock  int    `json:"stock"`
}

type changeReq struct {
	Change int `json:"change"`
}

func TestHealth(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	health(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestStockUpdateAndGet(t *testing.T) {
	// Update stock
	b, _ := json.Marshal(changeReq{Change: 5})
	req := httptest.NewRequest(http.MethodPost, "/stock/book-123", bytes.NewReader(b))
	rec := httptest.NewRecorder()
	updateStock(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on update, got %d", rec.Code)
	}
	var upd stockResp
	_ = json.Unmarshal(rec.Body.Bytes(), &upd)
	if upd.Stock <= 0 {
		t.Fatalf("expected stock > 0, got %d", upd.Stock)
	}

	// Get stock
	req2 := httptest.NewRequest(http.MethodGet, "/stock/book-123", nil)
	rec2 := httptest.NewRecorder()
	getStock(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Fatalf("expected 200 on get, got %d", rec2.Code)
	}
	var got stockResp
	_ = json.Unmarshal(rec2.Body.Bytes(), &got)
	if got.Stock != upd.Stock {
		t.Fatalf("expected stock %d, got %d", upd.Stock, got.Stock)
	}
}