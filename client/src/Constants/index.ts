// global actions
export const CREATE_ALERT = "CREATE_ALERT"
export const SET_SWITCH = "SET_SWITCH"
export const DELETE_ALERT = "DELETE_ALERT"
export const FETCH_ALERTS = "FETCH_ALERTS"
export const FETCH_ALERTS_SUCCESS = "FETCH_ALERTS_SUCCESS"
export const FETCH_ALERTS_ERROR = "FETCH_ALERTS_ERROR"
export const UPDATE_ALERT_CURRENCY = "UPDATE_ALERT_CURRENCY"
export const FETCH_CURRENCIES = "FETCH_CURRENCIES"
export const UPDATE_CURRENCY_NAME = "UPDATE_CURRENCY_NAME"
export const SET_CURRENCY_PRICE = "SET_CURRENCY_PRICE"
export const SET_CURRENCY_ERROR = "SET_CURRENCY_ERROR"
export const SET_ALERT_AMOUNT = "SET_ALERT_AMOUNT"
export const SET_ALERT_PERCENTAGE = "SET_ALERT_PERCENTAGE"
export const SET_ALERT_DURATION = "SET_ALERT_DURATION"
export const SET_ALERT_AMOUNT_ERROR = "SET_ALERT_AMOUNT_ERROR"
export const SET_ALERT_PERCENTAGE_ERROR = "SET_ALERT_PERCENTAGE_ERROR"
export const SET_ALERT_DURATION_ERROR = "SET_ALERT_DURATION_ERROR"
export const SET_ALERT_CONDITION = "SET_ALERT_CONDITION"
export const SET_ALERT_TIMEFRAME = "SET_ALERT_TIMEFRAME"
export const SET_ALERT_STATUS = "SET_ALERT_STATUS"
export const SET_ALERT_STATUS_SUCCESS = "SET_ALERT_STATUS_SUCCESS"
export const SET_ALERT_STATUS_ERROR = "SET_ALERT_STATUS_ERROR"
export const SET_ALERT_STATUS_CHECK = "SET_ALERT_STATUS_CHECK"
export const SET_ALERT_CURRENCY_ID = "SET_ALERT_CURRENCY_ID" 
export const WS_CONNECT = "WS_CONNECT"
export const WS_DISCONNECT = "WS_DISCONNECT"
export const SET_EMAIL = "SET_EMAIL"
// eslint-disable-next-line
export const REGEX_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// 60 seconds
export const PRICE_UPDATE_INTERVAL = 1000*60;

// themes 
export const lightTheme = {
    background: "#F1F1F1",
    main: "#FFF",
    shade: "#E5E5E5",
    tint: "rgba(143, 252, 255, .2)",
    opposite: "#000",
    boxShadow: "#999"
};
export const darkTheme = {
    background: "#20232C",
    main: "#000",
    tint: "rgba(80, 122, 152, .2)",
    shade: "#222C49",
    opposite: "#FFF",
    boxShadow: "rgba(0,0,0,0)"
};

// shared colors
export const PRIMARY_1 = "#2092E3"
export const PRIMARY_2 = "#135ABD"
export const ERROR = "#F43154"
export const SUCCESS = "#31F444"
export const CONDITION_OPTIONS = [
    {
        value: "Above",
        label: "Above"
    },
    {
        value: "Below",
        label: "Below"
    },
    {
        value: "Increase by",
        label: "Increase by"
    },
    {
        value: "Decrease by",
        label: "Decrease by"
    }
]
export const TIMEFRAME_OPTIONS = [
    {
        value: "Minutes",
        label: "Minutes"
    },
    {
        value: "Hours",
        label: "Hours"
    },
    {
        value: "Days",
        label: "Days"
    },
]
export const getSelectStyles = (width: string, colorUi: UiObject) => ({
    control: (styles: any) => ({ ...styles, background: colorUi.background, marginLeft: "10px", marginRight: "10px"}),
    input: (styles: any) => ({ ...styles, width, color: colorUi.opposite}),
    placeholder: (styles: any) => ({ ...styles, fontSize: "14px" }),
    singleValue: (styles: any) => ({ ...styles, color: colorUi.opposite}),
    option: (styles: any) => 
        ({ ...styles, background: colorUi.background, color: colorUi.opposite}),
})

export interface ICondition {
    value: string,
    percentage?: number,
    timeframe?: string,
    duration?: number
}
export interface IAlert {
    currency: string,
    currencyId: string,
    errors: ErrorLayout,
    isMet: boolean,
    amount: number,
    creationPrice: number,
    status: Status,
    condition: ICondition,
    _id: string,
}

export interface ICurrency {
    asset_id: string,
    name: string
}

export interface UiObject {
    background: string,
    main: string,
    shade: string,
    tint: string,
    opposite: string,
    boxShadow: string
}

export type ErrorLayout = {
    // object for alert error and string for app
    creationPrice: string,
    duration: string,
    percentage: string,
    amount: string,
    status: string
}

export const defaultAlertError = {
    creationPrice: "",
    duration: "",
    percentage: "",
    amount: "",
    status: ""
}
export interface IRootState {
    isLight: boolean,
    currencies: Array<ICurrency>,
    colorUi: UiObject,
    isFetching: boolean,
    alerts: ObjectLayout,
    errors: ErrorLayout,
    email: string
}

export const initialRootState: IRootState = {
    isLight: true,
    currencies: [],
    colorUi: lightTheme,
    isFetching: false,
    alerts: {},
    errors: defaultAlertError,
    email: ""
}

export type ObjectLayout = {
    [id:string]: IAlert;
}

export enum Status {
    started = "started",
    stopped = "stopped"
}