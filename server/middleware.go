package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"server/models"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gopkg.in/go-resty/resty.v2"
)

const connectionString = "mongodb+srv://admin:Pf1Kx9Jw001fzk5P@alertcluster-ubdrd.mongodb.net/test?retryWrites=true&w=majority"

const dbName = "main_db"

const HOST_ORIGIN = "http://localhost:3000"
const TIME_UPDATE = time.Second*10
const API_KEY = "2BA7AFB7-CACA-4229-9E7D-7681FA37AA87"

const collName = "alert_list"

var collection *mongo.Collection
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return r.Header.Get("Origin") == HOST_ORIGIN
	},
}

func init() {
	// init connection
	clientOptions := options.Client().ApplyURI(connectionString)
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// check connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to MongoDB!")

	collection = client.Database(dbName).Collection(collName)
	fmt.Println("Collection instance created!")
}

// GetAllAlerts Returns all alerts of user
func GetAllAlerts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Context-Type", "application/x-www-form-urlencoded")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	payload := getAllAlerts()
	json.NewEncoder(w).Encode(payload)
}

// GetAllAlerts Returns all currencies of API
func GetAllCurrencies(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Context-Type", "application/x-www-form-urlencoded")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	payload := getAllCurrencies()
	json.NewEncoder(w).Encode(payload)
}

func GetCreationPrice(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Context-Type", "application/x-www-form-urlencoded")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	params := mux.Vars(r)
	currencyId := params["currencyId"]
	payload := getExchangeData(currencyId)
	json.NewEncoder(w).Encode(payload)
}

func MonitorPrice(w http.ResponseWriter, r *http.Request) {
	// getting params and init websocket connection
	w.Header().Set("Context-Type", "application/x-www-form-urlencoded")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	params := mux.Vars(r)
	alertId := params["id"]
	currencyId := params["currencyId"]
	conn, _ := upgrader.Upgrade(w, r, nil)
	// handle price updating constraints and close messages
	go monitorCurrency(conn, alertId, currencyId)
	// go handleClose(conn)
}

func handleClose(conn *websocket.Conn) {
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			conn.Close()
		}
	}
}

func monitorCurrency(conn *websocket.Conn, alertId string, currencyId string){
	// creating channel that will send events every TIME_UPDATE
	ch := time.Tick(TIME_UPDATE)
	for range ch {
		rateData := getPrice(alertId, currencyId)
		conn.WriteJSON(rateData)
	}
}


func getPrice(alertId string, currencyId string) models.RateData {
	// get alert from db 
	alert := findInDatabase(alertId)
	// request exchange rate
	rateData := getExchangeData(currencyId)
	// handle condition logic
	rateData.UpdateMetStatus(alert)
	return rateData
}

func findInDatabase(alertId string) models.Alert{
	var alert models.Alert
	id, _ := primitive.ObjectIDFromHex(alertId)
	filter := bson.M{"_id": id}
	doc := collection.FindOne(
		context.Background(),
		filter,
	)
	doc.Decode(&alert)
	fmt.Println(alert)
	return alert
}

func getExchangeData(currencyId string) models.RateData {
	resp, err := resty.New().R().
		SetHeader("X-CoinAPI-Key", API_KEY).
		Get("https://rest.coinapi.io/v1/exchangerate/" + currencyId + "/USD")
	if err != nil {
		log.Fatal(err)
	}
	// decode results
	var result models.RateData
	if err := json.Unmarshal(resp.Body(), &result); err != nil {
		panic(err)
	}
	return result
}

// CreateAlert: Creates new alerts in DB
func CreateAlert(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Context-Type", "application/x-www-form-urlencoded")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	condition := models.Condition{
		Value:      "Above",
		Percentage: 0.0,
		Timeframe:  "Minutes",
		Duration:   0.0,
	}
	alert := models.Alert{
		ID:            primitive.NewObjectID(),
		CurrencyId:    "",
		IsMet:         false,
		Status:        "stopped",
		Currency:      "",
		CreationPrice: 0.0,
		Amount:        0.0,
		Condition:     condition,
	}
	fmt.Println(alert, r.Body)
	insertOneAlert(alert, w)
}

// UpdateAlert : update's an alert currency
func UpdateAlert(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/x-www-form-urlencoded")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "PUT")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	params := mux.Vars(r)
	var alert models.Alert
	_ = json.NewDecoder(r.Body).Decode(&alert)
	updateAlert(params["id"], alert)
	json.NewEncoder(w).Encode(params["id"])
}

// DeleteAlert : deletes an alert
func DeleteAlert(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Context-Type", "application/x-www-form-urlencoded")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	params := mux.Vars(r)
	deleteOneAlert(params["id"])
	json.NewEncoder(w).Encode(params["id"])
}

// get all alerts from the DB and returns them
func getAllCurrencies() []models.Currency {
	resp, err := resty.New().R().
		SetHeader("X-CoinAPI-Key", API_KEY).
		Get("https://rest.coinapi.io/v1/assets")
	if err != nil {
		log.Fatal(err)
	}
	// decode results
	var results []models.Currency
	if err := json.Unmarshal(resp.Body(), &results); err != nil {
		panic(err)
	}
	return results
}


func getAllAlerts() []primitive.M {
	// find all docs
	cur, err := collection.Find(context.Background(), bson.D{})
	if err != nil {
		log.Fatal(err)
	}
	// conver them to result arr
	var results []primitive.M
	for cur.Next(context.Background()) {
		var result bson.M
		e := cur.Decode(&result)
		if e != nil {
			log.Fatal(e)
		}
		results = append(results, result)

	}

	if err := cur.Err(); err != nil {
		log.Fatal(err)
	}

	cur.Close(context.Background())
	return results
}

// Insert one alert into DB
func insertOneAlert(alert models.Alert, w http.ResponseWriter) {
	_, err := collection.InsertOne(context.Background(), alert)
	if err != nil {
		log.Fatal(err)
	}
	json.NewEncoder(w).Encode(alert)
}

// update alert's currency
func updateAlert(alertId string, newAlert models.Alert) {
	// retrieve current alert in DB and update it
	id, _ := primitive.ObjectIDFromHex(alertId)
	fmt.Println("id", newAlert.CurrencyId)
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{
		"status":        newAlert.Status,
		"isMet":         newAlert.IsMet,
		"currency":      newAlert.Currency,
		"currencyId":    newAlert.CurrencyId,
		"creationPrice": newAlert.CreationPrice,
		"amount":        newAlert.Amount,
		"condition": bson.M{
			"value":      newAlert.Condition.Value,
			"percentage": newAlert.Condition.Percentage,
			"duration":   newAlert.Condition.Duration,
			"timeframe":  newAlert.Condition.Timeframe,
		},
	}}
	doc := collection.FindOneAndUpdate(
		context.Background(),
		filter,
		update,
	)
	fmt.Println("Document Update:", doc)
}

// delete one alert from the DB, delete by ID
func deleteOneAlert(alertId string) {
	fmt.Println(alertId)
	id, _ := primitive.ObjectIDFromHex(alertId)
	filter := bson.M{"_id": id}
	d, err := collection.DeleteOne(context.Background(), filter)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Deleted Document", d.DeletedCount)
}

