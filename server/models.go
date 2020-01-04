package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// Condition type used in Alert
type Condition struct {
	Value      string  `json:"value" bson:"value"`
	Percentage float32 `json:"percentage" bson:"percentage"`
	Timeframe  string  `json:"timeframe" bson:"timeframe"`
	Duration   float32 `json:"duration" bson:"duration"`
}

// Alert type for MDB
type Alert struct {
	ID            primitive.ObjectID `json:"_id,omitempty" bson:"_id"`
	IsMet         bool               `json:"isMet" bson:"isMet"`
	Status        string             `json:"status" bson:"status"`
	Currency      string             `json:"currency" bson:"currency"`
	CurrencyId    string             `json:"currencyId" bson:"currencyId"`
	CreationPrice float64            `json:"creationPrice" bson:"creationPrice"`
	Amount        float64            `json:"amount" bson:"amount"`
	Condition     Condition          `json:"condition" bson:"condition"`
}

// Currency
type Currency struct {
	AssetId  string  `json:"asset_id"`
	Name     string  `json:"name"`
}

// RateData
type RateData struct {
	Rate  float64 `json:"rate"`
	Error string  `json:"error"`
	IsMet bool    `json:"isMet"`
}

func (r* RateData) UpdateMetStatus(alert Alert) {
	r.IsMet = true
}
