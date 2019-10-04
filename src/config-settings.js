// timeouts in seconds
export const NETWORK_CONNECTION_TIMEOUT = 60;
export const HOTELS_STATIC_CONNECTION_TIMEOUT = 10;
export const HOTELS_SOCKET_CONNECTION_TIMEOUT = 15;
export const HOTELS_SOCKET_CONNECTION_UPDATE_TICK = 1;
export const SC_NAME = "SCPaymentModeOn";

export function setOption(name, value) {
  switch (name) {
    case 'experimental-search':
      hotelSearchIsNative.step1Results = value;
      break;
  
    default:
      break;
  }
}

// hotels search settings
export var hotelSearchIsNative = {
  step1Results: false,
  step2HotelDetails: true,
  step3BookingDetails: true,
  step4Payment: false
};
export const HOTELS_MINIMUM_RESULTS = 5;
export const HOTELS_INITIAL_ITEMS_TO_LOAD = 40;
export const HOTEL_ROOM_LIMITS = {
  MIN: {
    ROOMS: 1,
    ADULTS: 1,
    CHILDREN_PER_ROOM: 0
  },
  MAX: {
    ROOMS: 5,
    ADULTS: 10,
    CHILDREN_PER_ROOM: 4
  }
};
export const DEFAULT_HOTEL_PNG = "listings/images/listing_thumbnail_1529077862408_default.png";
export const DEFAULT_CRYPTO_CURRENCY = "EUR";
export const showNumberOnHotelItem = __DEV__ && false;
export const showBothMapAndListHotelSearch = false;
export const isFontScalingEnabled = false;
export const autoGetAllStaticPages = false;

export const OPTIONS = {
  guests: {
    SKIP_CHILDREN_NAMES: false
  },
  hotelReservation: {
    USE_INITIAL_BOOKING: true,
    BOOKING_RETRIES: 1,
    VALID_CHECK_INTERVAL: 10*1000 // in milliseconds
  },
  hotelSearchResults: {
    LAST_BEST_PRICE_TITLE: false,
    LAST_BEST_PRICE_DELAY: 2*1000, // in ms
  },
  hotelDetails: {
    showLocation: false
  },
  myTrips: {
    MAX_TRIPS_TO_LOAD: 1000
  },
  settings: (!!__DEV__)
}
export const BASIC_CURRENCY_LIST = ["EUR", "USD", "GBP"]; //eslint-disable-line

/**
 * Example usage:
 *    moment.utc("19/07/2003", TIME_FORMATS.SERVER_BIRTHDAY_UTC)
 */
export const TIME_FORMATS = {
  SERVER_BIRTHDAY_UTC: 'DD/MM/YYYY',
  UTC_ZONE: 'ZZ',
}
