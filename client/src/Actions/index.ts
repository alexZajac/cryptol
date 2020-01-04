import { 
    CREATE_ALERT, 
    DELETE_ALERT,
    SET_SWITCH,
    FETCH_ALERTS,
    FETCH_ALERTS_SUCCESS,
    FETCH_ALERTS_ERROR,
    UPDATE_CURRENCY_NAME,
    FETCH_CURRENCIES,
    SET_CURRENCY_PRICE,
    SET_CURRENCY_ERROR,
    SET_ALERT_AMOUNT,
    SET_ALERT_PERCENTAGE,
    SET_ALERT_DURATION,
    SET_ALERT_AMOUNT_ERROR,
    SET_ALERT_PERCENTAGE_ERROR,
    SET_ALERT_DURATION_ERROR,
    SET_ALERT_CONDITION,
    SET_ALERT_TIMEFRAME,
    SET_ALERT_STATUS,
    SET_ALERT_STATUS_SUCCESS,
    SET_ALERT_STATUS_ERROR,
    SET_ALERT_STATUS_CHECK,
    SET_ALERT_CURRENCY_ID,
    IAlert, 
    ObjectLayout,
    Status,
    defaultAlertError
} from "../Constants"

import axios, { AxiosResponse } from "axios";
import { Dispatch } from "redux";

// GLOBAL STATE ACTIONS
export const fetchCurrencies = (payload: object) => ({
    type: FETCH_CURRENCIES,
    payload
})

export const fetchAlerts = () => ({
    type: FETCH_ALERTS
})

export const fetchAlertsSuccess = (payload: object) => ({
    type: FETCH_ALERTS_SUCCESS,
    payload
})

export const fetchAlertsError = (payload: object) => ({
    type: FETCH_ALERTS_ERROR,
    payload
})

export const createAlert = (payload: object) => ({
    type: CREATE_ALERT,
    payload
})

export const deleteAlert = (payload: object) => ({
    type: DELETE_ALERT,
    payload
})

export const setSwitch = () => ({
    type: SET_SWITCH
})

// ALERT PROPER ACTIONS
export const setAlertStatus = (payload: object) => ({
    type: SET_ALERT_STATUS,
    payload
});

export const updateCurrencyPrice = (payload: object) => ({
    type: SET_CURRENCY_PRICE,
    payload
})

export const updateCurrencyError = (payload: object) => ({
    type: SET_CURRENCY_ERROR,
    payload
})

export const updateCurencyName = (payload: object) => ({
    type: UPDATE_CURRENCY_NAME,
    payload
})

export const setAlertAmount = (payload: object) => ({
    type: SET_ALERT_AMOUNT,
    payload
})
export const setAlertPercentage = (payload: object) => ({
    type: SET_ALERT_PERCENTAGE,
    payload
})
export const setAlertDuration = (payload: object) => ({
    type: SET_ALERT_DURATION,
    payload
})

export const setErrorAlertAmount = (payload: object) => ({
    type: SET_ALERT_AMOUNT_ERROR,
    payload
})
export const setErrorAlertPercentage = (payload: object) => ({
    type: SET_ALERT_PERCENTAGE_ERROR,
    payload
})
export const setErrorAlertDuration = (payload: object) => ({
    type: SET_ALERT_DURATION_ERROR,
    payload
})

export const setAlertCondition = (payload: object) => ({
    type: SET_ALERT_CONDITION,
    payload
})

export const setAlertTimeframe = (payload: object) => ({
    type: SET_ALERT_TIMEFRAME,
    payload
})

export const setAlertStatusCheck = (payload: object) => ({
    type: SET_ALERT_STATUS_CHECK,
    payload
})

export const setAlertStatusSuccess = (payload: object) => ({
    type: SET_ALERT_STATUS_SUCCESS,
    payload
})

export const setAlertStatusError = (payload: object) => ({
    type: SET_ALERT_STATUS_ERROR,
    payload
});

export const updateCurrencyId = (payload: object) => ({
    type: SET_ALERT_CURRENCY_ID,
    payload
});

// ACTION FUNCTIONS
export const fetchAlertsAction = () => (dispatch: Dispatch) => {
    dispatch(fetchAlerts());
    axios("/api/alerts")
    .then(res => res.data)
    .then(res => {
        if(res.error)
            alert(res.error);
        // converting results to array
        let alerts: ObjectLayout = {};
        res.forEach((a: IAlert) => alerts[a._id] = ({ ...a, errors: defaultAlertError}))
        dispatch(fetchAlertsSuccess({ alerts }));
        return alerts;
    })
    .catch(err => dispatch(fetchAlertsError(err)))
}

export const fetchCurrenciesAction = () => (dispatch: Dispatch) => {
    axios("/api/currencies")
    .then(res => res.data)
    .then(res => {
        if(res.error)
            alert(res.error);
        // converting results to array
        const currencies = res;
        dispatch(fetchCurrencies({ currencies }));
        return currencies;
    })
    .catch(err => dispatch(fetchAlertsError(err)))
}

export const getCreationPriceAction = (id: string, currencyId: string) => (dispatch: Dispatch) => {
    axios(`/api/creationPrice/${currencyId}`)
    .then((res: AxiosResponse<any>) => res.data)
    .then(res => {
        const { error, rate } = res;
        const price = Math.round(rate * 1000) / 1000;
        if(error.length > 0)
            dispatch(updateCurrencyError({ error, id, currency: "" }))
        else
            dispatch(updateCurrencyPrice({ id, price, isMet: false }));
    })
    .catch(err => alert(err))
}

export const updateCurrencyPriceAction = (id: string, currencyId: string) => (dispatch: Dispatch) => {
    const ws = new WebSocket(`ws://localhost:8080/api/getPrice/${id}/${currencyId}`)
    ws.addEventListener("message", res => {
        const { error, rate, isMet } = JSON.parse(res.data);
        const errorMsg = "CoinAPI doesn't have this asset's price for the moment, choose another!"
        const price = Math.round(rate * 1000) / 1000;
        if(error.length > 0)
            dispatch(updateCurrencyError({ error: errorMsg, id, currency: "" }))
        else
            dispatch(updateCurrencyPrice({ id, price, isMet }));
    })
}

export const createAlertAction = () => (dispatch: Dispatch) => {
    axios("/api/createAlert")
    .then((res: AxiosResponse<any>) => res.data)
    .then(res => {
        if(res.error)
            alert(res.error);
        const statusString = res.status;
        res.status = (<any>Status)[statusString];
        res.errors = defaultAlertError;
        dispatch(createAlert({ alert: res }))
        return res;
    })
    .catch(err => alert(err))
}

export const deleteAlertAction = (id: string) => (dispatch: Dispatch) => {
    axios.delete(`/api/deleteAlert/${id}`)
    .then((res: AxiosResponse<any>) => res.data)
    .then(res => {
        if(res.error)
            alert(res.error);
        dispatch(deleteAlert({ _id: res }))
        return res;
    })
    .catch(err => alert(err))
}

export const setAlertStatusSuccessAction = (id: string, status: Status) => (dispatch: Dispatch, getState: any) => {
    const alert = getState().alerts[id];
    alert.status = status;
    axios.put(`/api/updateAlert/${id}`, JSON.stringify(alert))
    .then((res: AxiosResponse<any>) => res.data)
    .then(res => {
        if(res.error)
            console.log(res.error);
        const id = res;
        dispatch(setAlertStatus({ id, status }))
        return id;
    })
    .catch(err => alert(err))
}