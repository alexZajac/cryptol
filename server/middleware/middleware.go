package middleware

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/smtp"
	"os"
	"strconv"

	"server/models"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gopkg.in/go-resty/resty.v2"
)

const dbName = "main_db"

var CONNECTION_STRING = os.Getenv("CONNECTION_STRING")
var API_KEY = os.Getenv("API_KEY")
var SENDER = os.Getenv("SENDER")
var SMTP_PASSWORD = os.Getenv("SMTP_PASSWORD")

const collName = "alert_list"

var collection *mongo.Collection

func init() {
	// init connection
	clientOptions := options.Client().ApplyURI(CONNECTION_STRING)
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
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	params := mux.Vars(r)
	alertId := params["id"]
	currencyId := params["currencyId"]
	payload := getPrice(alertId, currencyId)
	json.NewEncoder(w).Encode(payload)
}

func getPrice(alertId string, currencyId string) models.RateData {
	// get alert from db
	alert := findInDatabase(alertId)
	// request exchange rate
	rateData := getExchangeData(currencyId)
	// handle condition logic
	rateData.UpdateMetStatus(&alert)
	// update last price(s) for alert
	updateAlert(alertId, alert, false)
	// send email if met
	if rateData.IsMet {
		sendEmail(alert, rateData)
	}
	rateData.ID = alertId
	return rateData
}

func findInDatabase(alertId string) models.Alert {
	var alert models.Alert
	id, _ := primitive.ObjectIDFromHex(alertId)
	filter := bson.M{"_id": id}
	doc := collection.FindOne(
		context.Background(),
		filter,
	)
	doc.Decode(&alert)
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

func sendEmailWithSmtp(addr string, a smtp.Auth, from string, to []string, msg []byte) error {
	c, err := smtp.Dial(addr)
	if err != nil {
		return err
	}
	defer c.Close()
	if ok, _ := c.Extension("STARTTLS"); ok {
		host, _, _ := net.SplitHostPort(addr)
		config := &tls.Config{InsecureSkipVerify: true, ServerName: host}

		if err = c.StartTLS(config); err != nil {
			return err
		}
	}
	if a != nil {
		if ok, _ := c.Extension("AUTH"); ok {
			if err = c.Auth(a); err != nil {
				return err
			}
		}
	}
	if err = c.Mail(from); err != nil {
		return err
	}
	for _, addr := range to {
		if err = c.Rcpt(addr); err != nil {
			return err
		}
	}
	w, err := c.Data()
	if err != nil {
		return err
	}
	_, err = w.Write(msg)
	if err != nil {
		return err
	}
	err = w.Close()
	if err != nil {
		return err
	}
	return c.Quit()
}

func sendEmail(alert models.Alert, data models.RateData) {
	// Receiver email address.
	to := []string{
		alert.Email,
	}
	// smtp server configuration.
	smtpServer := models.SmtpServer{Host: "smtp.gmail.com", Port: "587"}
	// Message
	baseMsg := "Your condition for the alert concerning " + alert.Currency + " (" + alert.CurrencyId + ") has been met! "
	conditionMsg := ""

	if alert.Condition.Value == "Above" || alert.Condition.Value == "Below" {
		conditionMsg = "The condition " + alert.Condition.Value + " " + strconv.FormatFloat(alert.Amount, 'f', 3, 64) + " USD has been met with rate " + strconv.FormatFloat(data.Rate, 'f', 2, 64) + " USD."
	} else {
		conditionMsg = "The price has " + alert.Condition.Value + " " + strconv.FormatFloat(data.Percentage, 'f', 3, 64) + "% in " + strconv.FormatFloat(alert.Condition.Duration, 'f', 2, 64) + " " + alert.Condition.Timeframe + " or less."
	}
	messageString := baseMsg + conditionMsg
	message := []byte(messageString)
	// Authentication.
	auth := smtp.PlainAuth("", SENDER, SMTP_PASSWORD, smtpServer.Host)
	// Sending email.
	err := sendEmailWithSmtp(smtpServer.Address(), auth, SENDER, to, message)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("Email Sent!")
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
		PriceUpdates:  []float64{},
		Condition:     condition,
		Email:         "",
	}
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
	updateAlert(params["id"], alert, true)
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
func updateAlert(alertId string, newAlert models.Alert, isNew bool) {
	// retrieve current alert in DB and update it
	priceUpdates := []float64{newAlert.CreationPrice}
	if !isNew {
		priceUpdates = newAlert.PriceUpdates
	}
	id, _ := primitive.ObjectIDFromHex(alertId)
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{
		"status":        newAlert.Status,
		"isMet":         newAlert.IsMet,
		"currency":      newAlert.Currency,
		"currencyId":    newAlert.CurrencyId,
		"creationPrice": newAlert.CreationPrice,
		"priceUpdates":  priceUpdates,
		"amount":        newAlert.Amount,
		"email":         newAlert.Email,
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
	fmt.Println(doc)
}

// delete one alert from the DB, delete by ID
func deleteOneAlert(alertId string) {
	id, _ := primitive.ObjectIDFromHex(alertId)
	filter := bson.M{"_id": id}
	d, err := collection.DeleteOne(context.Background(), filter)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Deleted Document", d.DeletedCount)
}
