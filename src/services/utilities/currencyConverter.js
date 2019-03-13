class CurrencyConverter {
    static convert(exchangeRates, from, to, quantity) {
        let result = NaN;
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

        if (isNaN(result)) {
            if (exchangeRates && quantity) throw error;
            else result = ''
        }

        return result;
    }
}

export {
    CurrencyConverter
};