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
    SEARCH_HOME_RESULTS_TILE: "Home Search",
    SEARCH_HOME_DETAILS_TILE: "Home Details & Booking",
    SEARCH_HOTEL_RESULTS_TILE: "Hotel Search",
    SEARCH_HOTEL_DETAILS_TILE: "Hotel Details & Booking",
}


export default {
    SERVER,
    TEXT
}