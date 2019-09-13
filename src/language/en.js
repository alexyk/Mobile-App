const SERVER = {
  BOOKING_STATUS: {
    DONE: "COMPLETE",
    CONFIRMED: "PENDING",
    FAIL: "BOOKING FAILED",
    FAILED: "BOOKING FAILED",
    PENDING: "PENDING",
    // PENDING_CANCELLATION:               "PENDING",
    QUEUED: "PENDING",
    QUEUED_FOR_CONFIRMATION: "PENDING",
    QUEUED_FOR_CANCELLATION: "PENDING",
    CANCELLED: "CANCELLED",
    // CANCELLATION_FAILED:                "CANCELLED",
    PENDING_SAFECHARGE_CONFIRMATION: "PENDING"
  }
};

const TEXT = {
  MY_TRIPS_BOOKING_STATUS: "Status",
  MY_TRIPS_BOOKING_REF_NO: "Reference no",
  MYTRIPS_NO_IMAGE: "No image",
  MYTRIPS_FILTER: "Filter trips",
  SEARCH_HOME_RESULTS_TILE: "Home Search Results",
  SEARCH_HOME_DETAILS_TILE: "Home Details & Booking",
  SEARCH_HOTEL_RESULTS_TILE: "Hotel Search Results",
  SEARCH_HOTEL_DETAILS_TILE: "Hotel Details & Booking",
  SEARCH_HOTEL_RESULTS_FOUND: "$$1 hotels",
  SEARCH_HOTEL_RESULTS_PRICES: "$$1 available",
  SEARCH_HOTEL_RESULTS_PRICES_LOADING: "Searching for matches ...",
  SEARCH_HOTEL_RESULTS_HOTELS_LOADING: "Loading hotels ...",
  SEARCH_HOTEL_RESULTS_PRICES_TIMEOUT: "Price service is slow",
  SEARCH_HOTEL_RESULTS_HOTELS_TIMEOUT: "Hotels service is slow",
  SEARCH_HOTEL_RESULTS_FILTERED: "%1 matches",
  SEARCH_HOTEL_RESULTS_FILTERED_ONE: "1 match",
  SEARCH_HOTEL_RESULTS_FIRST_FILTER_IN_PROGRESS: "Loading all available matches",
  SEARCH_HOTEL_RESULTS_ALL_DONE: "Search completed",
  SEARCH_HOTEL_RESULTS_APPLYING_FILTER: "Applying filters",
  SEARCH_HOTEL_SOCKET_RESULTS_LOADING: "%1 match(es) and loading ...",
  SEARCH_HOTEL_STATIC_RESULTS_LOADED: "Possible matches best price and loading ...",
  SEARCH_HOTEL_FILTER_NA: "Filtering is disabled while loading in progress",
  SEARCH_HOTEL_FILTER_ERROR: "Filtering error",
  SEARCH_HOTEL_FILTERED_MSG: "Filtering out hotels that are not available for your dates",
  SEARCH_HOTEL_ITEM_PRICE_NA: "Price unavailable",
  SEARCH_HOTEL_ITEM_PRICE_LOADING: "",
  BOOKING_STEPS: ["Guest Info", "Confirm and Pay"],
  NO_ROOMS: "No rooms available. Please try a different search.",
  ROOM_NA: "The room was not available for booking. Please try again later or select another room.",
  VERIFICATION_EMAIL_MESSAGE: "It seems that your email has not yet been verified. You need to verify your email before you can proceed with your booking.",
  NETWORK_ERROR: "There was an error while connecting to the server. Please check your Internet connection and try again later.",
  "VERIFICATION_EMAIL_SUCCESS": 'Verification e-mail sent successfully',
  "VERIFICATION_EMAIL_ERROR": 'There was an error when sending verification e-mail'
};

export default {
  SERVER,
  TEXT
};
