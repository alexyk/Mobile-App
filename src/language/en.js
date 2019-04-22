const SERVER = {
    BOOKING_STATUS: {
        DONE:                               "COMPLETE",
        CONFIRMED:                          "PENDING",
        FAIL:                               "BOOKING FAILED",
        FAILED:                             "BOOKING FAILED",
        PENDING:                            "PENDING",
        // PENDING_CANCELLATION:               "PENDING",
        QUEUED:                             "PENDING",
        QUEUED_FOR_CONFIRMATION:            "PENDING",
        QUEUED_FOR_CANCELLATION:            "PENDING",
        CANCELLED:                          "CANCELLED",
        // CANCELLATION_FAILED:                "CANCELLED",
        PENDING_SAFECHARGE_CONFIRMATION:    "PENDING"
    }
};

const TEXT = {
    MY_TRIPS_BOOKING_STATUS: 'Status',
    MY_TRIPS_BOOKING_REF_NO: 'Reference no',
    MYTRIPS_NO_IMAGE: 'No image',
    MYTRIPS_FILTER: "Filter trips",
    SEARCH_HOME_RESULTS_TILE: "Home Search Results",
    SEARCH_HOME_DETAILS_TILE: "Home Details & Booking",
    SEARCH_HOTEL_RESULTS_TILE: "Hotel Search Results",
    SEARCH_HOTEL_DETAILS_TILE: "Hotel Details & Booking",
    SEARCH_HOTEL_RESULTS_FOUND: "Hotels: $$1",
    SEARCH_HOTEL_RESULTS_PRICES: "Prices: $$1",
    SEARCH_HOTEL_RESULTS_PRICES_LOADING: "Loading prices ...",
    SEARCH_HOTEL_RESULTS_HOTELS_LOADING: "Loading hotels ...",
    SEARCH_HOTEL_RESULTS_PRICES_TIMEOUT: "Price service is slow",
    SEARCH_HOTEL_RESULTS_HOTELS_TIMEOUT: "Hotels service is slow",
    SEARCH_HOTEL_RESULTS_FILTERED: "%1 hotels filtered",
    SEARCH_HOTEL_RESULTS_FILTER_IN_PROGRESS: "Filtering hotels",
    SEARCH_HOTEL_FILTER_NA: "Filter is disabled while loading",
    SEARCH_HOTEL_ITEM_PRICE_NA: "Price unavailable",
    SEARCH_HOTEL_ITEM_PRICE_LOADING: ""
}


export default {
    SERVER,
    TEXT
}