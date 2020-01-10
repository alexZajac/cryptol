import { 
    CREATE_ALERT, 
    SET_SWITCH,
    DELETE_ALERT,
    FETCH_ALERTS,
    FETCH_ALERTS_SUCCESS,
    FETCH_ALERTS_ERROR,
    UPDATE_CURRENCY_NAME,
    SET_CURRENCY_PRICE,
    SET_CURRENCY_ERROR,
    SET_ALERT_AMOUNT_ERROR,
    SET_ALERT_PERCENTAGE_ERROR,
    SET_ALERT_DURATION_ERROR,
    SET_ALERT_CONDITION,
    SET_ALERT_TIMEFRAME,
    SET_ALERT_STATUS,
    SET_ALERT_STATUS_SUCCESS,
    SET_ALERT_STATUS_ERROR,
    SET_EMAIL,
    IRootState,
    lightTheme,
    darkTheme,
    FETCH_CURRENCIES,
    initialRootState,
    SET_ALERT_CURRENCY_ID
} from "../Constants"

const mainReducer = (state: IRootState = initialRootState, action: any): IRootState => {
    if(action.type === SET_SWITCH){
        const { isLight } = state;
        const newTheme = !isLight;
        const colorUi = newTheme ? lightTheme : darkTheme;
        return { ...state, isLight: newTheme, colorUi };
    }
    else if(action.type === FETCH_ALERTS){
        return { ...state, isFetching: true }
    }
    else if(action.type === FETCH_ALERTS_SUCCESS){
        const { alerts } = action.payload;
        return { ...state, alerts, isFetching: false }
    }
    else if(action.type === FETCH_ALERTS_ERROR){
        const { error } = action.payload;
        const stateErrors = { ...state.errors, "fetching": error };
        return { ...state, errors: stateErrors, isFetching: false }
    }
    else if(action.type === FETCH_CURRENCIES){
        const { currencies } = action.payload;
        return { ...state, currencies }
    }
    else if(action.type === SET_EMAIL){
        const { email } = action.payload;
        return { ...state, email }
    }
    else if(action.type === CREATE_ALERT){
        const { alert } = action.payload;
        const { _id } = alert;
        const alerts = { ...state.alerts, [_id]: alert};
        return { ...state, alerts };
    }
    else if(action.type === DELETE_ALERT){
        const { _id } = action.payload;
        const { [_id]: _, ...alerts } = state.alerts
        return { ...state, alerts };
    }
    else if(action.type === SET_CURRENCY_PRICE){
        const { price, id, isMet } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.creationPrice = price;
        toChange.isMet = isMet;
        toChange.errors = { ...toChange.errors, creationPrice: ""};
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if (action.type === SET_CURRENCY_ERROR){
        const { error, id, currency } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.errors = { ...toChange.errors, creationPrice: error};
        toChange.currency = currency;
        toChange.creationPrice = 0;
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if(action.type === UPDATE_CURRENCY_NAME){
        const { id, currency } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.currency = currency;
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if(action.type === SET_ALERT_AMOUNT_ERROR){
        const { id, error, amount } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.errors.amount = error;
        toChange.amount = amount;
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if(action.type === SET_ALERT_PERCENTAGE_ERROR){
        const { id, error, percentage } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.errors.percentage = error;
        toChange.condition.percentage = percentage;
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if(action.type === SET_ALERT_DURATION_ERROR){
        const { id, error, duration } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.errors.duration = error;
        toChange.condition.duration = duration;
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if (action.type === SET_ALERT_CONDITION){
        const { id, condition } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.condition["value"] = condition;
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if (action.type === SET_ALERT_TIMEFRAME){
        const { id, timeframe } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.condition["timeframe"] = timeframe;
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if (action.type === SET_ALERT_STATUS || action.type === SET_ALERT_STATUS_SUCCESS){
        const { id, status } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.status = status;
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if(action.type === SET_ALERT_STATUS_ERROR){
        const { id, error, status } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.status = status;
        toChange.errors = { ...toChange.errors, status: error }
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else if(action.type === SET_ALERT_CURRENCY_ID){
        const { id, currencyId } = action.payload;
        // eslint-disable-next-line
        const { [id]: toChange, ...rest } = state.alerts;
        toChange.currencyId = currencyId;
        const alerts = { ...state.alerts, [id]: toChange };
        return { ...state, alerts };
    }
    else
        return state
}

export default mainReducer;