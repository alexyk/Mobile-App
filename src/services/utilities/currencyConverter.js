class CurrencyConverter {
    static convert(exchangeRates, from, to, quantity) {
        let result = -1;
        try {
            result = quantity * exchangeRates[from][to]
        } catch (error) {
            console.warn('[currencyConverter] Error when converting', 
                {error,exchangeRates,from,to,quantity});
        }

        return result;
    }
}

export {
    CurrencyConverter
};