import { SET_ALERT_AMOUNT, SET_ALERT_PERCENTAGE, SET_ALERT_DURATION, SET_ALERT_STATUS_CHECK, Status, IAlert, REGEX_EMAIL } from "../Constants";
import { setErrorAlertAmount, setErrorAlertPercentage, setErrorAlertDuration, setAlertStatusSuccessAction, setAlertStatusError, updateCurrencyPrice } from "../Actions";
import { Dispatch } from "redux";

interface IMiddleware {
  dispatch: Dispatch<any>;
  getState?: any;
}

interface IAmount {
  error: string,
  amount: number
}

interface IPercentage {
  error: string,
  percentage: number
}

interface IDuration {
  error: string,
  duration: number
}

const validateAlertAmount = (alertAmount: string): IAmount => {
  if (isNaN(+alertAmount)) {
    return { error: "Alert amount is not a number", amount: 0 };
  }
  return { error: "", amount: +alertAmount };;
};

const validateAlertPercentage = (alertPercentage: string): IPercentage => {
    if (isNaN(+alertPercentage)) {
      return { error: "Alert percentage is not a number", percentage: 0 };
    }
    if (+alertPercentage <= 0) {
        return  { error: "The alert percentage must be greater than 0!", percentage: 0 };
    }
    return  { error: "", percentage: +alertPercentage };
  };

  const validateAlertDuration = (alertDuration: string): IDuration => {
    if (isNaN(+alertDuration)) {
      return { error: "Alert duration is not a number", duration: 0 };
    }
    if (+alertDuration <= 0 || +alertDuration > 1000) {
      return { error: `The alert duration must be between ${0.0} and ${1000.0}`, duration: 0 };
    }
    return { error: "", duration: +alertDuration };
  };

  const validateAlertStatus = (alert: IAlert, email: string): string => {
    if(!REGEX_EMAIL.test(email.toLowerCase()))
        return "Email is invalid!"
    if(alert.currency === "")
        return "No currency provided"
    else if(alert.amount === 0 && (alert.condition.value === "Above" || alert.condition.value === "Below"))
        return "Target amount is set to 0 !"
    else{
      const { value, percentage, duration } = alert.condition;
      if (value !== "Above" && value !== "Below"){
        if(percentage === 0)
            return "Percentage change is zero"
        if(duration === 0)
            return "Duration of change is zero"
      }
    }
    return "";
  };

export const alertAmountMiddleware = ({ dispatch }: IMiddleware) => (
  next: any
) => (action: any) => {
  if (action.type !== SET_ALERT_AMOUNT) {
    return next(action);
  }
  const { amount, id } = action.payload;
  const { error, amount: newAmount }: IAmount = validateAlertAmount(amount);
  dispatch(setErrorAlertAmount({ error, id, amount: newAmount }));
};

export const alertPercentageMiddleware = ({ dispatch }: IMiddleware) => (
    next: any
  ) => (action: any) => {
    if (action.type !== SET_ALERT_PERCENTAGE) {
      return next(action);
    }
    const { percentage, id } = action.payload;
    const { error, percentage: newPercentage }: IPercentage = validateAlertPercentage(percentage);
    dispatch(setErrorAlertPercentage({ error, id, percentage: newPercentage }));
  };

  export const alertDurationMiddleware = ({ dispatch }: IMiddleware) => (
    next: any
  ) => (action: any) => {
    if (action.type !== SET_ALERT_DURATION) {
      return next(action);
    }
    const { duration, id } = action.payload;
    const { error, duration: newDuration }: IDuration = validateAlertDuration(duration);
    dispatch(setErrorAlertDuration({ error, id, duration: newDuration }));
  };

export const alertStatusMiddleware = ({ dispatch, getState }: IMiddleware) => (
    next: any
  ) => (action: any) => {
    if (action.type !== SET_ALERT_STATUS_CHECK) {
      return next(action);
    }
    else {
        const { id, status } = action.payload;
        if(status === Status.stopped)
            return dispatch(setAlertStatusSuccessAction(id, Status.stopped));
        // start action, must check
        else{      
            const state = getState();
            const { email } = state;
            // eslint-disable-next-line
            const { [id]: alert, ...rest } = state.alerts;
            const error = validateAlertStatus(alert, email);
            if (error === "")
                dispatch(setAlertStatusSuccessAction(id, Status.started));
            else
                dispatch(setAlertStatusError({ id, status: Status.stopped, error }));
          }
    }
  };

  export const socketMiddleware = ({ dispatch }: IMiddleware) => {
    let socket: any = null;

    const onOpen = () => {
      console.log('websocket open');
    };
  
    const onClose = () => {
      console.log("store closed")
    };
  
    const onMessage = (event: any) => {
      const payload = JSON.parse(event.data);
      if(payload !== "connectionTest"){
        let { rate: price, isMet, id } = payload;
        price = Math.round(price * 100000) / 100000;
        dispatch(updateCurrencyPrice({ id, price, isMet }));
      }

    };

    return (next: any) => (action: any) => {
      switch (action.type) {
        case 'WS_CONNECT':
          if (socket !== null) {
            socket.close();
          }
          const { host } = action.payload;
          // connect to the remote host
          socket = new WebSocket(host);
          // websocket handlers
          socket.addEventListener("message", onMessage);
          socket.addEventListener("close", onClose)
          socket.addEventListener("open", onOpen);
          break;
        case 'WS_DISCONNECT':
          if (socket !== null) 
              socket.close();
          socket = null;
          break;
        default:
          return next(action);
      }
    }
  }