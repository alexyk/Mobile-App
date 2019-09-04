// timeouts in seconds
export const NETWORK_CONNECTION_TIMEOUT = 15;
export const HOTELS_STATIC_CONNECTION_TIMEOUT = 10;
export const HOTELS_SOCKET_CONNECTION_TIMEOUT = 15;
export const HOTELS_SOCKET_CONNECTION_UPDATE_TICK = 1;
export const SC_NAME = "SCPaymentModeOn";

// hotels search settings
export const hotelSearchIsNative = {
  step1Results: true,
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
