package router

import (
	"server/middleware"
	"github.com/gorilla/mux"
)

// Router is exported and used in main.go
func Router() *mux.Router {

	router := mux.NewRouter()
	router.HandleFunc("/api/alerts", middleware.GetAllAlerts).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/currencies", middleware.GetAllCurrencies).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/createAlert", middleware.CreateAlert).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/creationPrice/{currencyId}", middleware.GetCreationPrice).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/getPrice/{id}/{currencyId}", middleware.MonitorPrice)
	router.HandleFunc("/api/updateAlert/{id}", middleware.UpdateAlert).Methods("PUT", "OPTIONS")
	router.HandleFunc("/api/deleteAlert/{id}", middleware.DeleteAlert).Methods("DELETE", "OPTIONS")
	return router
}