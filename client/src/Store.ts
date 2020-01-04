import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import mainReducer from "./Reducers";
import { alertAmountMiddleware, alertPercentageMiddleware, alertDurationMiddleware, alertStatusMiddleware } from "./Middlewares"
import { composeWithDevTools } from "redux-devtools-extension";

const middlewares = [
  thunk, 
  alertPercentageMiddleware, 
  alertDurationMiddleware, 
  alertAmountMiddleware, 
  alertStatusMiddleware
];

const store = createStore(
  mainReducer,
  composeWithDevTools(
    applyMiddleware(...middlewares)
  )
);

export default store;