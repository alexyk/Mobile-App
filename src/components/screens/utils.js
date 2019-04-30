import moment from "moment";
import { basePath, DEFAULT_HOTEL_PNG } from "../../config";
import { log } from "../../config-debug";
import _ from "lodash";

export const DISPLAY_MODE_NONE = "mode_none";
export const DISPLAY_MODE_SEARCHING = "mode_searching";
export const DISPLAY_MODE_RESULTS_AS_LIST = "mode_results_as_list";
export const DISPLAY_MODE_RESULTS_AS_MAP = "mode_results_as_map";
export const DISPLAY_MODE_HOTEL_DETAILS = "mode_hotel_details";

export function createHotelSearchInitialState(params) {
  const startDate = moment().add(1, "day");
  const endDate = moment().add(2, "day");

  let roomsData = [
    {
      adults: 2,
      children: []
    }
  ];

  let initialState = {
    isHotel: true,
    regionId: "",
    error: null,

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

    checkInDateFormated: startDate.format("DD/MM/YYYY").toString(),
    checkOutDateFormated: endDate.format("DD/MM/YYYY").toString(),
    checkInDate: startDate.format("ddd, DD MMM").toString(),
    checkOutDate: endDate.format("ddd, DD MMM").toString(),

    guests: 2,
    adults: 2,
    children: 0,
    infants: 0,
    childrenBool: false,
    daysDifference: 1,
    roomsDummyData: encodeURI(JSON.stringify(roomsData)),

    //filters
    isFilterResult: false,
    search: "",
    cities: [],
    showUnAvailable: false,
    nameFilter: "",
    selectedRating: [false, false, false, false, false],
    orderBy: "rank,desc",
    priceRange: [1, 5000],
    priceRangeSelected: [1, 5000],

    editable: false,

    isNewSearch: false,

    // webview - to be removed
    webViewUrl: ""
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

export function mergeAllHotelData(filtered, socketMap) {
  let result = filtered;
  try {
    result.forEach(item => parseHotelDataForMap(item, socketMap))
  } catch (e) {log('error','error in merging', {e})}
  return result;
}

const useLongCoordinates = true;  // used in parse functions (long is latutude/longitude and short is lat/lon)
function parseHotelDataForMap(data,socketMap) {
  if (typeof(data.latitude) == 'string') {
    if (useLongCoordinates) {
      data.latitude = parseFloat(data.latitude)
      data.longitude = parseFloat(data.longitude)
    } else {
      data.lat = parseFloat(data.latitude)
      data.lon = parseFloat(data.longitude)
      delete data.latitude
      delete data.longitude
    }
  }

  const cached = socketMap[data.id];
  if (cached) {
    //log('cached', `Updating from cache ${data.id}`,{data,cached},true)
    Object.assign(data, cached);
  }

  if (data.hotelData == null) {
    data.hotelPhoto = {url:''}
  }
  if (data.thumbnail == null) {
    data.thumbnail = {url:''}
    if (  typeof(data.hotelPhoto)=='string' ) {
      data.thumbnail = {url:data.hotelPhoto}
      data.hotelPhoto = data.thumbnail
    }
  } else if (typeof(data.thumbnail)=='string') {
    data.thumbnail = {url:data.thumbnail}
  }
  
  return data
}

/**
 * Parse current hotelData and return it as initial coordinates
 * @param {Object} hotelData
 * @param {Object} hotelsSocketCacheMap
 * @param {Object} hotelsIndicesByIdMap
 * @param {Array} hotelsInfo
 * @param {Number} index
 */
export function parseAndCacheHotelDataFromSocket(
  hotelData,
  hotelsSocketCacheMap,
  hotelsIndicesByIdMap,
  hotelsInfo,
  index = null,
  oldData = null
) {
  if (index == null) {
    index = hotelsIndicesByIdMap[hotelData.id];
  }
  const indexNotNull = index != null;
  const current = (
    oldData
      ? oldData
      : indexNotNull && hotelsInfo
        ? hotelsInfo[index]
        : hotelData
  );

  let lat = (hotelData.latitude != null ? hotelData.latitude : hotelData.lat);
  let lon = (hotelData.longitude != null ? hotelData.longitude : hotelData.lon);
  lat = parseFloat(lat != null ? lat : (current.lat ? current.lat : current.latitude))
  lon = parseFloat(lon != null ? lon : (current.lon ? current.lon : current.longitude))

  let parsedInfo = {
    id: hotelData.id,
    name: hotelData.name,
    price: parseFloat(
      !isNaN(hotelData.price) ? hotelData.price : current.price
    ),
    star: (hotelData.star != null 
    	? hotelData.star 
    	: (hotelData.stars != null
	    		? hotelData.stars
  	  		: (current.star != null ? current.star : current.stars)
  	  	)
    ),
    hotelPhoto: (hotelData.hotelPhoto ? hotelData.hotelPhoto : current.hotelPhoto),
    thumbnail:
      hotelData.thumbnail && hotelData.thumbnail.url
        ? hotelData.thumbnail
        : current.thumbnail
  };

  if (!parsedInfo.hotelPhoto || parsedInfo.hotelPhoto.url == '') {
    parsedInfo.hotelPhoto = parsedInfo.thumbnail;
  }

  if (useLongCoordinates) {
    parsedInfo.latitude = lat;
    parsedInfo.longitude = lon;
  } else {
    parsedInfo.lat = lat;
    parsedInfo.long = lon;
  }

  if (hotelData.hotelPhoto) {
    parsedInfo.hotelPhoto = (hotelData.hotelPhoto.url ? hotelData.hotelPhoto : {url: hotelData.hotelPhoto})
  }
  
  if (parsedInfo.latitude != null) {
    parsedInfo.latitude = parseFloat(parsedInfo.latitude)
    parsedInfo.longitude = parseFloat(parsedInfo.longitude)
  }

  hotelsSocketCacheMap[hotelData.id] = parsedInfo;

  const result = {
    initialLat: lat,
    initialLon: lon
  };

  return result;
}

function isNumber(value) {
  return (typeof(value) == 'number')
}

export function hasValidCoordinatesForMap(data, isInitial = false) {
  //log('utils', `hasValidCoordinatesForMap(), data: ${data} isInitital: ${isInitial}, useLongCoordinates: ${useLongCoordinates}`,{data,useLongCoordinates})
  if (data == null) return false;
  
  let lat,lon;
  try {
    if (isInitial) {
      lat = data.initialLat;
      lon = data.initialLon;
    } else {
      if (useLongCoordinates) {
        lat = data.latitude;
        lon = data.longitude;
      } else {
        lat = data.lat;
        lon = data.lon;
      }
    }
  }
  catch (e) {
    log('error-coordinates',e)
  }

  //log('utils', `hasValidCoordinatesForMap(), lat/lon: ${lat}/${lon}`,{lat,lon})
  const result = (lat != null && lon != null && isNumber(lat) && isNumber(lon));
  //log('utils', `hasValidCoordinatesForMap(), result: ${result}, isInitial: ${isInitial}`,{data,result,lat,lon})
  
  return result;
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
export function updateHotelsFromSocketCache(
  prevState,
  socketHotelsCacheMap,
  hotelIdsMap
) {
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
    socketIds.map(id => {
      const index = hotelIdsMap[id];
      const staticData = index != null ? hotelsInfoFresh[index] : null;
      let refreshedData = staticData;
      if (staticData != null) {
        const socketData = socketHotelsCacheMap[id];

        //TODO: @@debug
        //console.tron.log(`[utils::updateHotelsFromSocketCache] Updated hotel with index ${index}`, {socketData, staticData});

        refreshedData = _.merge({}, socketData, staticData);
        //delete socketHotelsCacheMap[id];

        hotelsInfoFresh[index] = refreshedData;
      }

      if (hasValidCoordinatesForMap(refreshedData)) {
        hotelsInfoForMapFresh.push(refreshedData);
      }

      return id;
    });
  }

  return { hotelsInfoFresh, hotelsInfoForMapFresh };
}

/**
 * Populate targetMap with indices from array
 * @param {Object} targetMap The target map to update as "[index]: item.id"
 * @param {Array} array The Array with items to get item.id from
 */
export function updateHotelIdsMap(targetMap, array) {
  // TODO: Performance - check if this is too intensive
  // console.time('Update hotelIdsMap');
  array.map((item, index) => {
    targetMap[item.id] = index;
    return item;
  });
  // console.timeEnd('Update hotelIdsMap');
}

export function updateHotelsFromFilters(hotelsFromFilters, oldHotels, oldIdsById) {
  let indicesById = {};
  let socketCache = {}
  let initialCordinates = null;
  const parsedHotels = hotelsFromFilters.map((item,index) => {
    // try getting old one (oldHotels is usually state.hotelsInfo)
    let oldHotel = {};
    try {oldHotel = oldHotels[oldIdsById[item.id]];} catch (e) {console.error('[utils::updateHotelsFromFilters] Hotel old data not found')}
    
    // update hotel data
    indicesById[item.id] = index;
    const res = parseAndCacheHotelDataFromSocket(item, socketCache, indicesById, null, index, oldHotel);
    if (!initialCordinates) {
      initialCordinates = res;
    }
    item = socketCache[item.id];

    return item;
  })

  const result = {
    hotelsFromFilters: parsedHotels,
    indicesById,
    socketCache,
    initialCordinates
  };

  return result
}

export function applyHotelsSearchFilter(data, filter) {
  console.time('*** utils::applyHotelsSearchFilter()')

  const doFilter = function(data,type,value, showUnAvailable) {
    const tmp = (typeof(value) == 'string' ? value.split(',') : [value])
    const value1 = tmp[0]
    const value2 = (tmp.length == 2 ? tmp[1] : null)
    let result = data;
    
    switch (type) {

      case 'orderBy':
        if (value1 == 'priceForSort') {
            if (value2 == 'asc') {
              result.sort((a,b) => (a.price > b.price))
            } else {
              result.sort((a,b) => (a.price < b.price))
            }
				} else {
            //log('TODO',`Not implemented filter: '${value1}':'${value2}'   //   TYPE: '${type}'`,null,true)
        }
        break;

      case 'nameFilter':
        const nameFilter = value1.toLowerCase();
        result = data.filter((item) => item.name.toLowerCase().indexOf(nameFilter) > -1)
        break;

      case 'priceRange':
        const v1 = parseFloat(value[0])
        const v2 = parseFloat(value[1])
        result = data.filter((item) => ((v1 <= item.price && item.price <= v2) || (item.price == null && showUnAvailable)) )
        //log('utils',`Filter priceRange, ${value}`, {value,data,result,v1,v2},true)
        break;

      case 'selectedRating':
      	let hasStarToFilter = false;
      	value.map((item,index) => ( hasStarToFilter = (item ?  true : hasStarToFilter) ))
				if (hasStarToFilter) {
					result = data.filter((item) => value[item.star-1])
				}
      	break
      	
      default:
        //log('TODO',`Not implemented filter: '${value1}':'${value2}'`)   //   TYPE: '${type}'`,null,true)
        break

    }
      
    //log('utils',`Filter Applied '${type}', value: '${value}' | in: ${data.length} out: ${result.length}`, {value,data,result},true)

    return result
  }
  
  let filtered = data.concat() // make a shallow copy
  for (let prop in filter) {
    if (prop == 'showUnAvailable') {
      // priceRange used for this one
      continue;
    }
  	const value = filter[prop];
    filtered = doFilter(filtered, prop, value, filter.showUnAvailable);
  }
  
  //log('utils',`applyHotelsSearchFilter(): ${filtered.length} / ${data.length}`, {filter,data,result:filtered},true)
  
  console.timeEnd('*** utils::applyHotelsSearchFilter()')
  return filtered
}

export function generateFilterInitialData(showUnAvailable=false, state) {
  const priceRange = state.priceRange;
  
  return {
    showUnAvailable,
    nameFilter: state.nameFilter,
    selectedRating: state.selectedRating,
    orderBy: state.orderBy,
    priceRange,
    priceRangeSelected: null
  };
}

function mapStars(stars) {
  let hasStars = false;
  const mappedStars = [];
  stars.forEach(s => {
    if (s) {
      hasStars = true;
    }
  });

  if (!hasStars) {
    for (let i = 0; i <= 5; i++) {
      mappedStars.push(i);
    }
  } else {
    mappedStars.push(0);
    stars.forEach((s, i) => {
      if (s) {
        mappedStars.push(i + 1);
      }
    });
  }

  return mappedStars;
}

export function generateHotelFilterString(page, state) {
  const filtersObj = {
    showUnavailable: state.showUnAvailable,
    name: state.nameFilter,
    minPrice: state.priceRange[0],
    maxPrice: state.priceRange[1],
    stars: mapStars(state.selectedRating)
  };

  // const page = page;//this.listView.getPage();
  const sort = state.orderBy;
  const pagination = `&page=${page}&sort=${sort}`;

  let filters = `&filters=${encodeURI(JSON.stringify(filtersObj))}` 
                + (page > -1 ? pagination : ''); //eslint-disable-line

  return filters;
}

export function generateSearchString(state, props) {
  let search = `?region=${state.regionId}`;
  search += `&currency=${props.currency}`;
  search += `&startDate=${state.checkInDateFormated}`;
  search += `&endDate=${state.checkOutDateFormated}`;
  search += `&rooms=${state.roomsDummyData}`;
  return search;
}

export function generateWebviewInitialState(params, state = null) {
  if (state) {
    params = {
      ...params,
      ...getWebviewExtraData(state, params)
    };
  }
  const checkInDateFormated = params ? params.checkInDateFormated : "";
  const checkOutDateFormated = params ? params.checkOutDateFormated : "";
  const roomsDummyData = params ? params.roomsDummyData : [];
  const regionId = params ? params.regionId : 0;

  const initialState = {
    ...state,
    guests: params ? params.guests : 0,
    isHotelSelected: params ? params.isHotelSelected : false,
    countryId: params ? params.countryId : 0,
    regionId,
    checkInDateFormated,
    checkOutDateFormated,
    roomsDummyData,
    currency: params.currency,
    email: params ? params.email : "",
    token: params ? params.token : "",
    propertyName: params ? params.propertyName : "",
    message: params ? params.message : "",
    title: params ? params.title : "",
    isHotel: params ? params.isHotel : null,
    canGoBack: false,
    canGoForward: false,
    canGoToResults: false,
    showProgress: true
  };

  const webViewUrl =
    basePath +
    generateWebviewUrl(
      initialState,
      roomsDummyData,
      params && params.baseUrl ? params.baseUrl : null
    );

  initialState.webViewUrl = webViewUrl;

  return initialState;
}

/**
 * @initialState (Object) all needed initial properties (see function body)
 * @baseUrl (String) null if you want to leave it to be automatically generated
 */
export function generateWebviewUrl(initialState, rooms, baseUrl = null) {
  let result = baseUrl;
  const baseHomeUrl = "homes/listings/?";
  const baseHotelUrl = "mobile/hotels/listings?";

  if (initialState.isHotelSelected) {
    // hotels specific properties
    if (!result) result = baseHotelUrl;
    result += "region=" + initialState.regionId;
    result += "&rooms=" + rooms;
  } else {
    // homes specific properties
    if (!result) result = baseHomeUrl;
    result += "countryId=" + initialState.countryId;
    result += "&guests=" + initialState.guests;
  }

  // common properties
  result += "&currency=" + initialState.currency;
  result += "&startDate=" + initialState.checkInDateFormated;
  result += "&endDate=" + initialState.checkOutDateFormated;
  result += "&priceMin=1&priceMax=5000";
  result += "&authEmail=" + initialState.email;
  result += "&authToken=" + initialState.token.replace(" ", "%20");

  return result;
}

export function getWebviewExtraData(state, extraData = {}) {
  return {
    isHotelSelected: state.isHotel,
    guests: state.guests,
    countryId: state.countryId,
    regionId: state.regionId,
    checkOutDateFormated: state.checkOutDateFormated,
    checkInDateFormated: state.checkInDateFormated,
    roomsDummyData: state.roomsDummyData, //encodeURI(JSON.stringify(state.roomsData)),
    email: state.email,
    token: state.token,
    search: state.search,
    ...extraData
  };
}

export function gotoWebview(state, navigation, extraData = {}) {
  navigation.navigate("WebviewScreen", getWebviewExtraData(state, extraData));
}

export function debugHotelData(hotelData, hotelsInfo, index, funcName) {
  console.warn(
    `    #hotel-search# [HotelsSearchScreen] ${funcName} ` +
      ` id:${hotelData.id.toString().padStart(7, " ")},` +
      ` price: [${(hotelsInfo[index] && hotelsInfo[index].price
        ? hotelsInfo[index].price
        : "n/a"
      )
        .toString()
        .padStart(7, " ")}]=>` +
      `${
        hotelData.price
          ? hotelData.price.toString().padStart(7, " ")
          : "".padEnd(7, " ")
      }` +
      ` name: '${
        hotelData.name
          ? hotelData.name.substr(0, 30).padEnd(30, " ")
          : "".padEnd(30, " ")
      }',` +
      ` pic: '${
        hotelData.hotelPhoto
          ? `*${hotelData.hotelPhoto.url.substr(0, 30).padEnd(29, " ")}`
          : hotelsInfo[index].hotelPhoto
          ? hotelsInfo[index].hotelPhoto.url.substr(0, 30).padEnd(30, " ")
          : "".padEnd(30, " ")
        // `photo: ${item.hotelPhoto.url.substr(0,20)}, ` +
        // `name: ${item.name.substr(0,20).padEnd(20,' ')}, ` +
        // `star: ${item.star}`
      }',`
  );
}
