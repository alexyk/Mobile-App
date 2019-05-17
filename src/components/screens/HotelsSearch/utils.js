import moment from "moment";
import lodash from "lodash";
import { validateObject, isObject, isNumber } from '../utils'
import { showNumberOnHotelItem, DEFAULT_HOTEL_PNG } from "../../../config";
import { log, checkHotelsDataWithTemplates } from "../../../config-debug";

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
  if (showNumberOnHotelItem) {
    result.forEach( (item,index) => {
      item.no = (index + 1);
      return item;
    })
  }

  return result;
}

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

const useLongCoordinates = true;  // used in parse functions (long is latitude/longitude and short is lat/lon)
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
 * @returns (Object) The result has the following properties: {hotelData:Object, initialCoord: {initialLat:Number,initialLon:Number}}
 */
export function combineHotelData(socketData, staticData) {
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

  hotelData.stars = ( star!=null ? star : stars)
  if (hotelData.stars == null && staticData) {
    const {star:s2,stars:s3} = staticData;
    hotelData.stars = (s2!=null ? s2 : (s3!=null ? s3 : []));  
  }
  if (hotelData.stars == null) {
    hotelData.stars = [];
  } else {
    hotelData.stars = Array(parseInt(hotelData.stars)).fill();
  }
  hotelData.star = hotelData.stars;
  
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
  const current = (
    oldData
      ? oldData
      : indexNotNull && hotelsInfo
        ? hotelsInfo[index]
        : hotelData
  );

  log('list-parse-socket',`${hotelData.name}, id:${hotelData.id}`, {hotelData,oldData,current,indexNotNull,index,hotelsSocketCacheMap,hotelsIndicesByIdMap});

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
  if (hotelData.hotelPhoto) {
    parsedInfo.hotelPhoto = (hotelData.hotelPhoto.url ? hotelData.hotelPhoto : {url: hotelData.hotelPhoto})
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

/**
 * Checks whether data is null, an empty string or an object with 
 * a property url null or an empty string
 */
function hasValidImageData(data,type) {
  return (! (!data || !data[type] || (isObject(data[type]) && !data[type].url)) )
}


function newObject(source, extra) {
	return lodash.merge({}, source, extra)
}

export function checkHotelData(data, type, index) {
  if (!__DEV__ || !checkHotelsDataWithTemplates) return;
  
	const isArray = (data instanceof Array);
  let result = '';
  let props;
  let failed = 0;

  if (isArray) {
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
    log(`X-${type}`, `@${result}@, index: ${index} failed: ${isArray ? failed : 'n/a'}, isArray: ${isArray}`,{invalid_types:result,data,type,props, isArray},true);
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
