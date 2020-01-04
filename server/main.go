package main

import (
    "fmt"
    "log"
    "net/http"
    "server/router"
)

const port = ":8080"

func main() {
    r := router.Router()
    fmt.Println("Starting server on the port 8080...")
    log.Fatal(http.ListenAndServe(port, r))
}