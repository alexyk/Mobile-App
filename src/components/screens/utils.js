import moment from "moment"
import {
  basePath
} from '../../config'
import _ from "lodash"

export const DISPLAY_MODE_NONE            = 'mode_none'
export const DISPLAY_MODE_SEARCHING       = 'mode_searching'
export const DISPLAY_MODE_RESULTS_AS_LIST = 'mode_results_as_list'
export const DISPLAY_MODE_RESULTS_AS_MAP  = 'mode_results_as_map'
export const DISPLAY_MODE_HOTEL_DETAILS   = 'mode_hotel_details'

export function createHotelSearchInitialState(params) {

  const startDate = moment().add(1, 'day');
  const endDate = moment().add(2, 'day');
  
  let roomsData = [{
    adults: 2,
    children: []
  }];

  let initialState = {
    isFilterResult: false,
    search: '',
    cities: [],

    isHotel: true,
    regionId: '',

    hotelsInfo: [],
    hotelsInfoForMap: [],
    hotelsLoadedInList: 0, 
    totalHotels: 0,
    pricesFromSocketValid: 0,
    pricesFromSocket: 0,
    allElements: false,
    displayMode: DISPLAY_MODE_NONE,
    initialLat: null,
    initialLon: null,
    isDoneSocket: false,

    isSocketTimeout: false,
    isStaticTimeout: false,

    isLoading: true, // progress dialog
    
    checkInDateFormated: startDate.format('DD/MM/YYYY').toString(),
    checkOutDateFormated: endDate.format('DD/MM/YYYY').toString(),
    checkInDate: startDate.format('ddd, DD MMM').toString(),
    checkOutDate: endDate.format('ddd, DD MMM').toString(),

    guests: 2,
    adults: 2,
    children: 0,
    infants: 0,
    childrenBool: false,
    daysDifference: 1,
    roomsDummyData: encodeURI(JSON.stringify(roomsData)),
    //filters
    showUnAvailable: false,
    nameFilter: '',
    selectedRating: [false, false, false, false, false],
    orderBy: 'rank,desc',
    priceRange: [1, 5000],

    editable: false,

    isNewSearch: false,

    // webview - to be removed
    webViewUrl: ''
  };
  if (params) {
    initialState.isHotel = params.isHotel;
    initialState.search = params.searchedCity;
    initialState.regionId = params.regionId;
    initialState.checkInDate = params.checkInDate;
    initialState.checkInDateFormated = params.checkInDateFormated;
    initialState.checkOutDate = params.checkOutDate;
    initialState.checkOutDateFormated = params.checkOutDateFormated;

    initialState.guests = params.guests;
    initialState.adults = params.adults;
    initialState.children = params.children;
    initialState.infants = params.infants;
    initialState.childrenBool = params.childrenBool;

    initialState.roomsDummyData = params.roomsDummyData;
    initialState.daysDifference = params.daysDifference;
  }

  return initialState;
}

/**
 * Parse current hotelData and return it as initial coordinates
 * @param {Object} hotelData 
 * @param {Object} hotelsSocketCacheMap 
 * @param {Object} hotelsIndicesByIdMap 
 * @param {Array} hotelsInfo 
 * @param {Number} index 
 */
export function parseAndCacheHotelDataFromSocket(hotelData, hotelsSocketCacheMap,  hotelsIndicesByIdMap, hotelsInfo, index=null) {
  if (index == null) {
    index = hotelsIndicesByIdMap[hotelData.id];
  }
  const indexNotNull = (index != null);
  const current = (indexNotNull && hotelsInfo ? hotelsInfo[index] : {lat:null, lon: null, price: null, thumbnail: {url:''}});
  const infoFromSocket = {
    id: hotelData.id,
    name: hotelData.name,
    price: parseFloat(!isNaN(hotelData.price) ? hotelData.price : current.price),
    lat: parseFloat(hotelData.lat != null ? hotelData.lat : current.lat),
    lon: parseFloat(hotelData.lon != null ? hotelData.lon : current.lon),
    thumbnail: 
        (hotelData.thumbnail && hotelData.thumbnail.url)
            ? hotelData.thumbnail
            : current.thumbnail
  }
  hotelsSocketCacheMap[hotelData.id] = infoFromSocket;

  const result = {
    initialLat: hotelData.lat,
    initialLon: hotelData.lon
  };
  
  return result;
}

export function hasValidCoordinatesForMap(state, isInitital=false) {
  if (!state) return false;

  if (isInitital) {
    return ((state.initialLat != null) && (state.initialLon != null))
  } else {
    return ((state.lat != null) && (state.lon != null))
  }
}
  
/**
 * (1) Gets previous hotels list
 * (2) Makes a fresh copy
 * (3) Updates with socket cache
 * (4) Deletes socket cach
 * @param {Object} hotelData {id, price, hotelPhoto, star etc...}
 * @param {Object} hotelsSocketCacheMap {id: socketData}
 * @param {Object} hotelsIndicesByIdMap {id: index}
 * @param {Object} prevState 
 * @param {Object} updatedProps 
 */
export function updateHotelsFromSocketCache(prevState, socketHotelsCacheMap, hotelIdsMap) {
  let hotelsInfoFresh = prevState.hotelsInfo;
  let hotelsInfoForMapFresh = prevState.hotelsInfoForMap;
  const socketIds = Object.keys(socketHotelsCacheMap);
  
  if (socketIds.length > 0) {
    // TODO: Performance - check if this is too intensive - creating a copy of all hotels
    // console.time('Create hotelsInfo copy on socket update');
    hotelsInfoFresh = [...prevState.hotelsInfo]; // shallow copy, same as Array.slice() ???
    // console.timeEnd('Create hotelsInfo copy on socket update');
    // TODO: @@debug - remove
    // debugHotelData(hotelData, hotelsInfo, index, '>> SOCKET DATA <<');

    // update hotel data that has socket cache
    socketIds.map((id) => {
        const index = hotelIdsMap[id]
        const staticData = (index != null ? hotelsInfoFresh[index] : null);
        let refreshedData = staticData;
        if (staticData != null) {
          const socketData = socketHotelsCacheMap[id];

          //TODO: @@debug
          // console.log(`[utils::updateHotelsFromSocketCache] Updated hotel with index ${index}`, {socketData, staticData});

          refreshedData = _.merge({}, socketData, staticData)
          delete socketHotelsCacheMap[id];

          hotelsInfoFresh[index] = refreshedData;
        }

        if (hasValidCoordinatesForMap(refreshedData)) {
          hotelsInfoForMapFresh.push(refreshedData);
        }

        return id;
    })
  }

  return {hotelsInfoFresh, hotelsInfoForMapFresh};
}
 
/**
 * Populate targetMap with indices from array
 * @param {Object} targetMap The target map to update as "[index]: item.id"
 * @param {Array} array The Array with items to get item.id from
 */
export function updateHotelIdsMap(targetMap, array) {
  // TODO: Performance - check if this is too intensive
  // console.time('Update hotelIdsMap');
  array.map(
    (item, index) => {
        targetMap[item.id] = index;
        return item;
    }
  );
  // console.timeEnd('Update hotelIdsMap');
}

export function generateSearchString(state, props) {
  let search = `?region=${state.regionId}`;
  search += `&currency=${props.currency}`;
  search += `&startDate=${state.checkInDateFormated}`;
  search += `&endDate=${state.checkOutDateFormated}`;
  search += `&rooms=${state.roomsDummyData}`;
  return search;
}

export function generateWebviewInitialState(params, state=null) {
  if (state) {
    params = {
        ...params,
        ...getWebviewExtraData(state,params)
    }
  }
  const checkInDateFormated   = params ? params.checkInDateFormated  : '';
  const checkOutDateFormated  = params ? params.checkOutDateFormated  : '';
  const roomsDummyData        = params ? params.roomsDummyData : [];
  const regionId              = params ? params.regionId : 0;

  const initialState = {
    ...state,
    guests:             params ? params.guests          : 0,
    isHotelSelected:    params ? params.isHotelSelected : false,
    countryId:          params ? params.countryId       : 0,
    regionId,
    checkInDateFormated,
    checkOutDateFormated,
    roomsDummyData,
    currency: params.currency,
    email:  params ? params.email : '',
    token:  params ? params.token : '',
    propertyName: params ? params.propertyName : '',
    message:  params ? params.message : '',
    title:  params ? params.title : '',
    isHotel:  params ? params.isHotel : null,
    canGoBack: false,
    canGoForward: false,
    canGoToResults: false,
    showProgress: true
  }

  const webViewUrl = basePath + generateWebviewUrl(
    initialState,
    roomsDummyData,
    (params && params.baseUrl)
        ? params.baseUrl
        : null
  );

  initialState.webViewUrl = webViewUrl;
  
  return initialState;
}

/**
 * @initialState (Object) all needed initial properties (see function body)
 * @baseUrl (String) null if you want to leave it to be automatically generated
 */
export function generateWebviewUrl(initialState, rooms, baseUrl=null) {
  let result = baseUrl;
  const baseHomeUrl = 'homes/listings/?'
  const baseHotelUrl = 'mobile/hotels/listings?'
    
  if ( initialState.isHotelSelected ) {
    // hotels specific properties 
    if (!result) result = baseHotelUrl;
    result += 'region=' + initialState.regionId
    result += '&rooms=' + rooms
  } else {
    // homes specific properties
    if (!result) result = baseHomeUrl;
    result += 'countryId=' + initialState.countryId
    result += '&guests=' + initialState.guests
  }
  
  // common properties
  result += '&currency=' + initialState.currency
  result += '&startDate=' + initialState.checkInDateFormated
  result += '&endDate=' + initialState.checkOutDateFormated
  result += '&priceMin=1&priceMax=5000'
  result += '&authEmail=' + initialState.email 
  result += '&authToken=' + initialState.token.replace(' ', '%20')

  return result;
}

export function getWebviewExtraData(state, extraData={}) {
  return {
    isHotelSelected: state.isHotel,
    guests: state.guests,
    countryId: state.countryId,
    regionId: state.regionId,
    checkOutDateFormated: state.checkOutDateFormated,
    checkInDateFormated: state.checkInDateFormated,
    roomsDummyData: state.roomsDummyData,//encodeURI(JSON.stringify(state.roomsData)),
    email: state.email,
    token: state.token,
    search: state.search,
    ...extraData
  }
}

export function gotoWebview(state, navigation, extraData={}) {
  navigation.navigate('WebviewScreen', getWebviewExtraData(state, extraData));
}

export function debugHotelData(hotelData, hotelsInfo, index, funcName) {
  console.warn(`    #hotel-search# [HotelsSearchScreen] ${funcName} ` +
    ` id:${hotelData.id.toString().padStart(7,' ')},` + 
    ` price: [${(hotelsInfo[index] && hotelsInfo[index].price ? hotelsInfo[index].price : 'n/a').toString().padStart(7, ' ')}]=>` +
        `${(hotelData.price ? hotelData.price.toString().padStart(7,' ') : ''.padEnd(7,' '))}` +
    ` name: '${hotelData.name ? hotelData.name.substr(0,30).padEnd(30,' ') : ''.padEnd(30, ' ')}',` +
    ` pic: '${
        hotelData.hotelPhoto
            ? `*${hotelData.hotelPhoto.url.substr(0,30).padEnd(29,' ')}`
            : (hotelsInfo[index].hotelPhoto ? hotelsInfo[index].hotelPhoto.url.substr(0,30).padEnd(30,' ') : ''.padEnd(30,' '))
    // `photo: ${item.hotelPhoto.url.substr(0,20)}, ` +
    // `name: ${item.name.substr(0,20).padEnd(20,' ')}, ` +
    // `star: ${item.star}`
    }',` 
  );
}

