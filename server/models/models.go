package models

import (
	"math"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Condition type used in Alert
type Condition struct {
	Value      string  `json:"value" bson:"value"`
	Percentage float64 `json:"percentage" bson:"percentage"`
	Timeframe  string  `json:"timeframe" bson:"timeframe"`
	Duration   float64 `json:"duration" bson:"duration"`
}

// Alert type for MDB
type Alert struct {
	ID            primitive.ObjectID `json:"_id,omitempty" bson:"_id"`
	IsMet         bool               `json:"isMet" bson:"isMet"`
	PriceUpdates  []float64          `json:"priceUpdates" bson:"priceUpdates"`
	Status        string             `json:"status" bson:"status"`
	Currency      string             `json:"currency" bson:"currency"`
	CurrencyId    string             `json:"currencyId" bson:"currencyId"`
	CreationPrice float64            `json:"creationPrice" bson:"creationPrice"`
	Amount        float64            `json:"amount" bson:"amount"`
	Condition     Condition          `json:"condition" bson:"condition"`
	Email         string             `json:"email" bson:"email"`
}

func (a *Alert) getMinutesDuration() int {
	result := a.Condition.Duration
	if a.Condition.Timeframe == "Hours" {
		result *= 60
	}
	if a.Condition.Timeframe == "Days" {
		result *= (60*24)
	}
	return int(result)
}

// Currency
type Currency struct {
	AssetId string `json:"asset_id"`
	Name    string `json:"name"`
}

// RateData
type RateData struct {
	ID         string  `json:"id"`
	Rate       float64 `json:"rate"`
	Error      string  `json:"error"`
	IsMet      bool    `json:"isMet"`
	Percentage float64 `json:"percentage"`
}

type SmtpServer struct {
	Host string
	Port string
}

// Address URI to smtp server
func (s *SmtpServer) Address() string {
	return s.Host + ":" + s.Port
}

func (r *RateData) UpdateMetStatus(alert *Alert) {
	// if error return false
	r.IsMet = false
	// if no errors
	if len(r.Error) == 0 {
		conditionValue := alert.Condition.Value
		if conditionValue == "Above"{
			if r.Rate >= alert.Amount {
				r.IsMet = true
				alert.PriceUpdates = []float64 { r.Rate }
			}
		} else if conditionValue == "Below"{
			if r.Rate <= alert.Amount {
				r.IsMet = true
				alert.PriceUpdates = []float64 { r.Rate }
			}
		} else {
			// get a slice of current data
			priceUpdatesSlice := alert.PriceUpdates[:]
			// if we have more elements than the condition duration, remove first elm
			minuteDuration := alert.getMinutesDuration()
			if len(priceUpdatesSlice) >= minuteDuration {
				priceUpdatesSlice = append(priceUpdatesSlice[:0], priceUpdatesSlice[1:]...)
			}
			// append last rate
			priceUpdatesSlice = append(priceUpdatesSlice, r.Rate)
			// check if there is a percentage change
			newPercentage := 0.0
			if conditionValue == "Increase by" {
				newPercentage = getMaxIncrease(priceUpdatesSlice)
			} else {
				newPercentage = getMaxDecrease(priceUpdatesSlice)
			}
			if newPercentage >= alert.Condition.Percentage {
				r.Percentage = newPercentage
				r.IsMet = true
				priceUpdatesSlice = []float64{ r.Rate }
			}
			alert.PriceUpdates = priceUpdatesSlice
		}
	}
}

func getMaxIncrease(pricesUpdates []float64) float64 {
	minRate, maxIncrease := pricesUpdates[0], 0.0
	for _, price := range pricesUpdates[1:] {
		minRate = math.Min(minRate, price)
		maxIncrease = math.Max(maxIncrease, (price-minRate)/price*100)
	}
	return maxIncrease
}

func getMaxDecrease(pricesUpdates []float64) float64 {
	maxRate, maxDecrease := pricesUpdates[0], 0.0
	for _, price := range pricesUpdates[1:] {
		maxRate = math.Max(maxRate, price)
		maxDecrease = math.Max(maxDecrease, (maxRate-price)/price*100)
	}
	return maxDecrease
}

