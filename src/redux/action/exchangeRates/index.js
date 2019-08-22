import { createAction } from "redux-actions";
import requester from "../../../initDependencies";
import { serverRequest } from "../../../services/utilities/serverUtils";

const exchangeRatesInfoType = {
  SET_CURRENCY_EXCHANGE_RATES: "SET_CURRENCY_EXCHANGE_RATES",
  SET_LOC_EUR_RATE: "SET_LOC_EUR_RATE",
  SET_LOC_RATE_FIAT_AMOUNT: "SET_LOC_RATE_FIAT_AMOUNT"
};

export const setCurrencyExchangeRates = createAction(
  exchangeRatesInfoType.SET_CURRENCY_EXCHANGE_RATES
);
export const setLocEurRate = createAction(
  exchangeRatesInfoType.SET_LOC_EUR_RATE
);
export const setLocRateFiatAmount = createAction(
  exchangeRatesInfoType.SET_LOC_RATE_FIAT_AMOUNT
);

export const getCurrencyRates = () => {
  return dispatch => {
    // prettier-ignore
    serverRequest("Action getCurrencyRates", requester.getCurrencyRates,[],
      currencyExchangeRates => dispatch(setCurrencyExchangeRates(currencyExchangeRates))
    );
  };
};

export const getLocRate = baseCurrency => {
  return dispatch => {
    // prettier-ignore
    serverRequest("Action getLocRate", requester.getLocRateByCurrency, [baseCurrency],
      data => {
        const parsedValue = 1 / parseFloat(data);
        dispatch(setLocEurRate(parsedValue));
      }
    );
  };
};
