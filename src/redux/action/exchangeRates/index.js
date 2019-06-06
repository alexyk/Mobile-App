import { createAction } from 'redux-actions';
import requester from '../../../initDependencies';
import { onNetworkError } from '../../../components/screens/utils';

const exchangeRatesInfoType = {
    SET_CURRENCY_EXCHANGE_RATES: 'SET_CURRENCY_EXCHANGE_RATES',
    SET_LOC_EUR_RATE: 'SET_LOC_EUR_RATE',
    SET_LOC_RATE_FIAT_AMOUNT: 'SET_LOC_RATE_FIAT_AMOUNT',
};

export const setCurrencyExchangeRates = createAction(exchangeRatesInfoType.SET_CURRENCY_EXCHANGE_RATES);
export const setLocEurRate = createAction(exchangeRatesInfoType.SET_LOC_EUR_RATE);
export const setLocRateFiatAmount = createAction(exchangeRatesInfoType.SET_LOC_RATE_FIAT_AMOUNT);

export const getCurrencyRates = () => {
    return dispatch => {
        requester.getCurrencyRates()
            .then(res => {
                if (res && res.body && res.success) {
                    res.body
                        .then(currencyExchangeRates => {
                            dispatch(setCurrencyExchangeRates(currencyExchangeRates));
                        })
                        .catch(function (error) {
                            onNetworkError(`Error with getCurrencyRates - at level 3: ${error.message}`, {error,res})
                        });
                } else {
                    onNetworkError(`Error with getCurrencyRates - at level 2`, {res})
                }
            })
            .catch(function (error) {
                onNetworkError(`Error with getCurrencyRates - at level 1: ${error.message}`, {error})
            });
    }
};


export const getLocRate = (baseCurrency) => {
    return dispatch => {
        requester.getLocRateByCurrency(baseCurrency)
            .then(res => {
                if (res && res.body && res.success) {
                    res.body
                    .then(data => {
                        const parsedValue = 1/parseFloat(data);
                        dispatch(setLocEurRate(parsedValue));
                    })
                    .catch(function (error) {
                        onNetworkError(`Error with getLocRateByCurrency - at level 3: ${error.message}`, {error,res})
                    });
                } else {
                    onNetworkError(`Error with getLocRateByCurrency - at level 2`, {res})
                }
            })
            .catch(function (error) {
                onNetworkError(`Error with getLocRateByCurrency - at level 1: ${error.message}`, {error})
            });
    }
}