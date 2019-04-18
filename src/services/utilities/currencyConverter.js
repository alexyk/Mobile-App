import {
    raiseConverterExceptions,
    logConverterError,
    logConverterErrorToReactrotron
} from '../../config-debug'

class CurrencyConverter {
    static convert(exchangeRates, from, to, quantity) {
        let result = null;
        let error = new Error(`converting currency from:'${from}' to:'${to}', quantity:'${quantity}'`);

        if (exchangeRates && from && to && quantity && exchangeRates[from] && exchangeRates[from][to]) {
            try {
                result = quantity * exchangeRates[from][to]
            } catch (errorCaught) {
                console.warn('[currencyConverter] Error when converting', 
                    {errorCaught,exchangeRates,from,to,quantity});
                error.message += ", Error caught: " + errorCaught.message;
            }
        }

        // several levels of error output - see config-debug.js
        if (result == null) {
            if (__DEV__ && raiseConverterExceptions) {
                throw error;
            }
            if (logConverterError) {
                console.error(`[currencyConverter] Error`, error);
            }
            if (logConverterErrorToReactrotron) {
                console.tron.error(`[currencyConverter] Error: "${error.message}"`, error)
            }
        }

        return result;
    }
}

export {
    CurrencyConverter
};