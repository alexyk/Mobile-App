import moment from "moment";
import lodash from "lodash";
import { validateObject, isObject, isNumber, isString, isArray } from '../utils'
import { showNumberOnHotelItem, DEFAULT_HOTEL_PNG } from "../../../config";
import { log, checkHotelsDataWithTemplates, processError } from "../../../config-debug";

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
    optimiseMapMarkers: true,
    hotelsLoadedInList: 0,
    totalHotels: 0,
    totalPages: 0,
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
    const tmp = (isString(value) ? value.split(',') : [value])
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
        if (nameFilter) {
          //log('doFilter-name',`items: ${data?data.length:'n/a'}`,{data})
          result = data.filter(item => {
            if (item && item.name && item) {
              result = (item.name.toLowerCase().indexOf(nameFilter) > -1);
            } else {
              result = true;
            }
            return result;
          })
        }
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

/**
 * Used while progressively loading first results after getting static data and socket prices
 */
export function hotelsTemporaryFilterAndSort(hotels) {
  // filter out items without price
  let result = hotels.filter(item => (!isNaN(item.price)))
  
  // sort by price, ascending
  result.sort((a,b) => (a.price > b.price))

  // add index
  if (__DEV__ && showNumberOnHotelItem) {
    result.forEach( (item,index) => {
      item.no = (index + 1);
      return item;
    })
  }

  return result;
}

/**
 * Gather statistical information from data
 * priceMin, priceMax, newIdsMap,
 * minLat, maxLat, minLon, maxLon
 */
export function processFilteredHotels(filtered, hotelsOld, hotelsOldIdsMap, priceMinOld, priceMaxOld) {
  let priceMin = priceMinOld;
  let priceMax = priceMaxOld;
  let newIdsMap = {}
  let minLat, maxLat, minLon, maxLon;

  // calculate min &max price
  filtered.map((item,index) => {
    const {price, latitude, longitude} = item;

    // log('processing',`${index}, id:${item.id}, name:'${item.name}', price:${price}, min:${priceMin} max:${priceMax}`)
    newIdsMap[item.id] = index;

    if (minLat == -1) {
      minLat = latitude;
      maxLat = latitude;
    } else if (minLon == -1) {
      minLon = longitude;
      maxLon = longitude;
    } else {
      if (latitude < minLat) {
        minLat = latitude;
      }
      if (latitude > maxLat) {
        maxLat = latitude;
      }
      if (longitude < minLon) {
        minLon = longitude;
      }
      if (longitude > maxLon) {
        maxLon = longitude;
      }
    }

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
    priceMin, priceMax, newIdsMap,
    minLat, maxLat, minLon, maxLon
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

/**
 * Merging all data from getting static hotels (getStaticHotels), through socket messages
 * and finally - filtered (getMapInfo)
 * @param {Array} filtered 
 * @param {Object} socketMap A map {id: hotelData, ...}
 * @param {Object} staticMap A map {id: hotelData, ...}
 */
export function mergeAllHotelData(filtered, socketMap, staticMap) {
  let result = filtered;
  try {
    result.forEach((item,index) => {
      const socketData = (socketMap ? socketMap[item.id] : null);
      const staticData = (staticMap ? staticMap[item.id] : null);
      
      // Safe parse hotelData
      let mergedData;
      try {
        mergedData = parseFilterHotelData(item, socketData, staticData)
      } catch (parseError) {
        console.warn(`[HotelsSearchScreen/utils::mergeAllHotelData] Parse error: ${parseError.message}`, {parseError,mergedData})
        mergedData = null;
      }

      if (mergedData) {
        mergedData.no = index + 1;
      } else {
        mergedData = item;
      }

      return mergedData;
    })
  } catch (e) {log('error','error in merging', {e})}
  return result;
}

const useLongCoordinates = true;  // used in parse functions (long is latitude/longitude and short is lat/lon)
function parseFilterHotelData(filterData,socketData,staticData) {
  let hotelData = Object.assign(filterData);

  if (isString(hotelData.latitude)) {
    if (useLongCoordinates) {
      hotelData.latitude = parseFloat(hotelData.latitude)
      hotelData.longitude = parseFloat(hotelData.longitude)
    } else {
      hotelData.lat = parseFloat(hotelData.latitude)
      hotelData.lon = parseFloat(hotelData.longitude)
      delete hotelData.latitude
      delete hotelData.longitude
    }
  }

  const hasPhoto = hasValidImageData(hotelData,'hotelPhoto');
  const hasThumb = hasValidImageData(hotelData,'thumbnail');
  const hasStaticPhoto = hasValidImageData(staticData,'hotelPhoto');
  const hasSocketThumb = hasValidImageData(socketData,'thumbnail');
  const patchedThumb = (hasSocketThumb ? socketData.thumbnail : null);
  if (!hasPhoto) hotelData.hotelPhoto = (hasStaticPhoto ? staticData.hotelPhoto : patchedThumb);
  if (!hasThumb) hotelData.thumbnail = patchedThumb;
  if (hotelData.hotelPhoto == null && hotelData.thumbnail == null) {
    hotelData.hotelPhoto = DEFAULT_HOTEL_PNG;
    hotelData.thumbnail = DEFAULT_HOTEL_PNG;
  } else {
    if (hotelData.hotelPhoto == null) {
      hotelData.hotelPhoto = hotelData.thumbnail;
    } else {
      hotelData.thumbnail = hotelData.hotelPhoto;
    }
  }
  
  return hotelData
}

/**
 * @returns (Object) The result has the following properties: {hotelData:Object, initialCoord: {initialLat:Number,initialLon:Number}}
 */
export function parseSocketHotelData(socketData, staticData) {
  let hotelData = Object.assign({},socketData);
  if (hotelData.lat) {
    delete hotelData.lat;
    delete hotelData.lon;
  }

  // parse images
  const hasSocketPhoto = hasValidImageData(socketData,'hotelPhoto');
  const hasSocketThumb = hasValidImageData(socketData,'thumbnail');
  const hasStaticPhoto = hasValidImageData(staticData,'hotelPhoto');
  const hasStaticThumb = hasValidImageData(staticData,'thumbnail');
  if (!hasSocketPhoto) {
    hotelData.hotelPhoto = (
      hasStaticPhoto
        ? staticData.hotelPhoto
        : hasSocketThumb
          ? socketData.thumbnail
          : hasStaticThumb ? staticData.thumbnail : DEFAULT_HOTEL_PNG
    );
  }
  if (!hasSocketThumb) {
    hotelData.thumbnail = hotelData.hotelPhoto;
  }

  const {star,stars} = socketData;

  hotelData.stars = ( star!=null ? parseInt(star) : (isArray(stars) ? stars.length : stars) );
  if (hotelData.stars == null && staticData) {
    const {star:s2,stars:s3} = staticData;
    hotelData.stars = (s2!=null ? parseInt(s2) : (s3!=null && isArray(s3) ? s3.length : 0));
  }
  if (star) {
    delete hotelData.star;
  }
  
  // parse coordinates
  let lat = (socketData.latitude != null ? socketData.latitude : socketData.lat);
  let lon = (socketData.longitude != null ? socketData.longitude : socketData.lon);
  lat = (lat != null ? parseFloat(lat) : null);
  lon = (lon != null ? parseFloat(lon) : null);
  hotelData.latitude = lat;
  hotelData.longitude = lon;
  let initialCoord = {
    initialLat: lat,
    initialLon: lon
  };
  if (!hasValidCoordinatesForMap(initialCoord, true)) {
    initialCoord = null;
  }

  return {
    hotelData,
    initialCoord
  };
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
  const backupData = (
    oldData
      ? oldData
      : indexNotNull && hotelsInfo
        ? hotelsInfo[index]
        : hotelData
  );

  log('list-parse-socket',`${hotelData.name}, id:${hotelData.id}`, {hotelData,oldData,current: backupData,indexNotNull,index,hotelsSocketCacheMap,hotelsIndicesByIdMap});
  
  const parsedInfo = parseSocketHotelData_Alt(hotelData);

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

function parseSocketHotelData_Alt(socketData) {
  let lat = (socketData.latitude != null ? socketData.latitude : socketData.lat);
  let lon = (socketData.longitude != null ? socketData.longitude : socketData.lon);
  lat = parseFloat(lat != null ? lat : (backupData.lat ? backupData.lat : backupData.latitude))
  lon = parseFloat(lon != null ? lon : (backupData.lon ? backupData.lon : backupData.longitude))

  const {id, name, price, star, stars, thumbnail} = socketData;
  let parsedInfo = {
    id,
    name,
    price: parseFloat(!isNaN(price) ? price : backupData.price),
    star: (star || stars || backupData.star || backupData.stars),
    thumbnail:
      thumbnail && thumbnail.url
        ? thumbnail
        : backupData.thumbnail
  };

  // if (!parsedInfo.hotelPhoto || parsedInfo.hotelPhoto.url == '') {
  //   parsedInfo.hotelPhoto = parsedInfo.thumbnail;
  // }
  if (socketData.hotelPhoto) {
    parsedInfo.hotelPhoto = (socketData.hotelPhoto.url ? socketData.hotelPhoto : {url: socketData.hotelPhoto})
  } else {
    parsedInfo.hotelPhoto = parsedInfo.thumbnail;
  }

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

  return parsedInfo;
}

/**
 * Checks whether data is null, an empty string or an object with 
 * a property url null or an empty string
 */
function hasValidImageData(data,type) {
  return (! (!data || !data[type] || (isObject(data[type]) && !data[type].url)) )
}


function newObject(source, extra=null) {
	return lodash.merge({}, source, extra)
}

export function checkHotelData(data, type, index) {
  if (!__DEV__ 
        || checkHotelsDataWithTemplates == false
        || ( isString(checkHotelsDataWithTemplates) && checkHotelsDataWithTemplates.indexOf(type) == -1 )
      )
  {
    return;
  }
  
	const isArrayInstance = (data instanceof Array);
  let result = '';
  let props;
  let failed = 0;

  if (isArrayInstance) {
    data.map((item,index) => {
      const result = checkHotelData(item,type,index)
      if (!result || result.length > 0) {
        failed++;
      }
    })
  } else {
		let commonData = {
			id:'number',
			name:'string',
		};
		
    switch (type) {

      case 'static':
        props = newObject(
        	commonData,
   				{
						generalDescription:'string',
   					hotelPhoto:{url:'string'},
            star:'number',
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
            stars: 'number',
            // dynamic
						externalId:'number',
						longitude:'number,null',
						latitude:'number,null',
						hotelPhoto:'string,object',//[{url:'string'},'string'],
						thumbnail:'object,string',
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
						// thumbnail: {url:'string'},
						price: 'number,null'
					}
				)
        result = validateObject(data, props);
        break;

        case 'filter-parsed':
          props = newObject(
            commonData,
            {
              no:'number',
              price:'number',
              priceForSort:'number',
              // required
              star:'number',
              generalDescription: 'null,string',
              longitude:'number,null',
              latitude:'number,null',
              hotelPhoto: 'string',
              thumbnail: 'string',
              // thumbnail: {url:'string'},
              price: 'number,null'
            }
          )
          result = validateObject(data, props);
          break;
    }
  }

  if (result.length > 0) {
    log(`X-${type}`, `@${result}@, index: ${index} failed: ${isArrayInstance ? failed : 'n/a'}, isArray: ${isArrayInstance}`,{invalid_types:result,data,type,props, isArrayInstance},true);
    //console.warn(`[utils::checkHotelData] @${result}@, index: ${index}`,{result,data,type,props})
  }
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
