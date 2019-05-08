import moment from "moment";
import { basePath } from "../../config";
import { log } from "../../config-debug";
import lodash from "lodash";

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
    selectedHotelData: null,

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
    result.forEach((item,index) => {
      item = parseHotelDataForMap(item, socketMap)
      item.no = index + 1;
      return item;
    })
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
  
  // parse props
  const {id, name, price, star, stars, thumbnail} = hotelData;
  let parsedInfo = {
    id,
    name,
    price: parseFloat(!isNaN(price) ? price : current.price),
    star: (star != null 
    	? star 
    	: (stars != null
	    		? stars
  	  		: (current.star != null ? current.star : current.stars)
  	  	)
    ),
    thumbnail:
      thumbnail && thumbnail.url
        ? thumbnail
        : current.thumbnail
  };

  // if (!parsedInfo.hotelPhoto || parsedInfo.hotelPhoto.url == '') {
  //   parsedInfo.hotelPhoto = parsedInfo.thumbnail;
  // }
  // if (hotelData.hotelPhoto) {
  //   parsedInfo.hotelPhoto = (hotelData.hotelPhoto.url ? hotelData.hotelPhoto : {url: hotelData.hotelPhoto})
  // }

  if (useLongCoordinates) {
    parsedInfo.latitude = lat;
    parsedInfo.longitude = lon;
  } else {
    parsedInfo.lat = lat;
    parsedInfo.long = lon;
  }

  if (parsedInfo.latitude != null) {
    parsedInfo.latitude = parseFloat(parsedInfo.latitude)
    parsedInfo.longitude = parseFloat(parsedInfo.longitude)
  }

  hotelsSocketCacheMap[hotelData.id] = parsedInfo;
  checkHotelData(parsedInfo,'socket-parsed',index)

  //@@@debug
  if (!hotelsSocketCacheMap['orig']) hotelsSocketCacheMap['orig'] = {}
  hotelsSocketCacheMap.orig[id] = hotelData;
  //@@@debug

  const result = {
    initialLat: lat,
    initialLon: lon
  };

  return result;
}

function isNumber(value) {
  return (typeof(value) == 'number')
}

function newObject(source, extra) {
	return lodash.merge({}, source, extra)
}

export function checkHotelData(data, type, index) {
  if (!__DEV__) return;
  
	const isArray = (data instanceof Array);
  let result = '';
	let props;

  if (isArray) {
    data.map((item,index) => checkHotelData(item,type,index))
  } else {
		let commonData = {
			id:'number',
			name:'string',
			star:'number',
		};
		
    switch (type) {

      case 'static':
        props = newObject(
        	commonData,
   				{
						generalDescription:'string',
   					hotelPhoto:{url:'string'}
   				}
        );
        result = validateObject(data, props);
        break;

      case 'socket-orig':
        props = newObject(
					commonData,
					{
						price:'number',
						// dynamic
						externalId:'number,null',
						longitude:'null,string',
						latitude:'null,string',
						thumbnail:'object,null',
						star:'string,null',
						stars:'number,null',
						lon:'string,null',
						lat:'string,null',
					}
				);
        result = validateObject(data, props);
        break;

      case 'socket-parsed':
        props = newObject(
					commonData,
					{
						price:'number',
						thumbnail:'string',
						// dynamic
						longitude:'number,null',
						latitude:'number,null',
						externalId:'string,null',
						thumbnail:'object,string,null',
					}
				)
        result = validateObject(data, props);
        break;

      case 'filter':
        props = newObject(
					commonData,
					{
						star:'number',
						price:'number',
						priceForSort:'number',
						// dynamic
						generalDescription: 'string,null',
						longitude:'string,null',
						latitude:'string,null',
						hotelPhoto: 'string,null',
						price: 'number,null'
					}
				)
        result = validateObject(data, props);
        break;

    }
  }

  if (result.length > 0) {
    //log(`X-${type}`, `@${result}@, index: ${index}`,{invalid_types:result,data,type,props},true);
    console.warn(`[utils::checkHotelData] @${result}@, index: ${index}`,{result,data,type,props})
  }
}

export function validateObject(sourceData, props, index=-1, path='') {
  let result = '';
  const space = '  ';

	if (sourceData == null) {
		result = `<null_object>;` + space;
	} else if (typeof(sourceData) != 'object') {
		result = `<not_an_object>_${typeof(sourceData)};` + space;
	}
	if (result.length > 0) {
		if (path.length > 0) {
				return `${path}:${result}`;
			} else {
				return result;
			}
	}

  let data = Object.assign({}, sourceData) // create a copy to remove used props thus leave new only
  const na = '__n/a__';

	if (path.length > 0) path += '.';
	
  for (let n in props) {
    const item = (data.hasOwnProperty(n) ? data[n] : na);
    let type1 = props[n];
    let type2 = (item !== null ? typeof(item) : 'null');
    let doDelete = true

		if (typeof(type1) == 'string' && type1.indexOf(',') > 0) {
			const types = type1.split(',')
			if (types.indexOf(type2) > -1) {
				// nothing to do
			} else {
				result += `${path}${n}:not_in_[${type1}]_${type2};` + space;
			}
    } else if (type1 == 'any') {
    	// nothing to do
    } else if ( item == na ) {
      result += `${path}${n}:na_${type2};` + space;
      doDelete = false;
    } else if (typeof(type1) == 'object') {      
      result += validateObject(item, type1, -1, `${n}`);
    } else if (type2 == 'string' && item.length == 0) {
      result += `${path}${n}:empty_str;` + space;
    } else if (type2 == 'number') {
      if (isNaN(item)) result += `${path}${n}:NaN;` + space;
    } else if (type1 != type2) {
      result += `${path}${n}:${type2};` + space;
    }
    
    if (doDelete) {
    	// filtering out checked prop
    	delete data[n];
    }
  }
  
  // checking for new fields in data that are not defined in props
  for (let n in data) {
    const type2 = typeof(data[n]);
    result += `${n}:new_${type2};` + space;  	
	}

  if (result.length > 0) {
    // remove last space
    result = result.substr(0,result.length - space.length)
	  //log('debug-in',`result: ${result} path: '${path}'  indx: ${index}, props: ${Object.keys(props)}`,{data:sourceData,props,path,index,result})
  }


  return result;
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
    log('error-coordinates',`[utils::hasValidCoordinatesForMap] error in calculating coordinates`,e)
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

        refreshedData = lodash.merge({}, socketData, staticData);
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

export function processFilteredHotels(filtered, hotelsOld, hotelsOldIdsMap, priceMinOld, priceMaxOld) {
  let priceMin = priceMinOld;
  let priceMax = priceMaxOld;
  let newIdsMap = {}

  // calculate min &max price
  filtered.map((item,index) => {
    const {price} = item;

    // process images
    // log('processing',`${index}, id:${item.id}, name:'${item.name}', price:${price}, min:${priceMin} max:${priceMax}`)

    const oldIndex = hotelsOldIdsMap[item.id];
    if (oldIndex != null) {
      item.hotelPhoto = hotelsOld[oldIndex].hotelPhoto;
      item.thumbnail = hotelsOld[oldIndex].thumbnail;
    }
    newIdsMap[item.id] = index;

    // process price
    if (price != null) {
      if (priceMax < price) {
        priceMax = price;
      }
      if (priceMin > price) {
        priceMin = price;
      }
    }
    return null
  })

  // process images
  // log('processing',`priceMin:${priceMin}, priceMax:${priceMax}`,{priceMin, priceMax, newIdsMap})

  return {
    priceMin, priceMax, newIdsMap
  }
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

/**
 * Used for optimising Map Marker rendering
 */
export function calculateCoordinatesGridPosition(lat, lon, regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep) {
  let regionStartLat = regionLat - regionLatDelta,
      regionEndLat   = regionLat + regionLatDelta,
      regionStartLon = regionLon - regionLonDelta,
      regionEndLon   = regionLon + regionLonDelta;
  
  // console.log(`regionLat: ${regionStartLat} / ${regionEndLat} regionLon: ${regionStartLon} / ${regionEndLon}`)

  // quick return if not in range
  if (lat < regionStartLat || lat > regionEndLat || lon < regionStartLon || lon > regionEndLon) {
    return null;
  }

  let result = null;
  let latIndex = 0;
  let lonIndex = 0;
  let currentLat = regionStartLat,
      currentLon = regionStartLon;

  while (currentLat <= regionEndLat) {
    currentLon = regionStartLon;
    while (currentLon <= regionEndLon) {
      if (currentLat >= lat && currentLat < lat + latStep
          && currentLon >= lon && currentLon < lon + lonStep)
      {
        result = {
          latIndex,
          lonIndex
        }
        break;
      } else {
        currentLon += lonStep;
        lonIndex++;
      }
    }
    currentLat += latStep;
    latIndex++;
  }

  return result;
}
