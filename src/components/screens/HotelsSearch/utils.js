import lodash from "lodash";
import { validateObject, isObject, isNumber, isString, isArray } from "../utils";
import { showNumberOnHotelItem, DEFAULT_HOTEL_PNG } from "../../../config-settings";
import { checkHotelsDataWithTemplates } from "../../../config-debug";
import { rlog, processError } from "../../../utils/debug/debug-tools";

export const DISPLAY_MODE_NONE = "mode_none";
export const DISPLAY_MODE_SEARCHING = "mode_searching";
export const DISPLAY_MODE_RESULTS_AS_LIST = "mode_results_as_list";
export const DISPLAY_MODE_RESULTS_AS_MAP = "mode_results_as_map";
export const DISPLAY_MODE_HOTEL_DETAILS = "mode_hotel_details";

var ids = {
  DAY_ID: 0,
  DAYS_ROW_ID: 0,
  MONTH_ID: 0,
  MAP_MARKER_ID: 0,
  SLIDE_SHOW_ID: 0,
  AVAILABLE_ROOMS_ID: 0
};
export function generateListItemKey(prop, prefix = "", doReset = false) {
  let id = ids[prop];
  if (id == null) {
    if (prop == null) {
      wlog(
        `[Calendar::utils::generateListItemKey] Name 'prop' is null - using 'NA' instead`
      );
      prop = "NA";
    } else {
      wlog(
        `[Calendar::utils::generateListItemKey] Name '${prop}' not found in ids - creating it`
      );
    }
    ids[prop] = 0;
  } else if (doReset) {
    id = 0;
  }

  id++;
  if (id == Number.MAX_VALUE) {
    id = 0;
  }
  ids[prop] = id;

  return `${prefix}_${id}`;
}

export function createHotelSearchInitialState(params, reduxCache) {
  const {
    roomsDummyData,
    guests,
    adults,
    children,
    checkInDate,
    checkOutDate,
    checkInDateFormated,
    checkOutDateFormated
  } = reduxCache;

  let initialState = {
    isHotel: true,
    regionId: "",
    error: null,

    hotelsInfo: [],
    hotelsInfoForMap: [],
    optimiseMapMarkers: true,
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

    checkInDate,
    checkOutDate,
    checkInDateFormated,
    checkOutDateFormated,

    guests,
    adults,
    children,
    daysDifference: 1,
    roomsDummyData,

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

    initialState.roomsDummyData = params.roomsDummyData;
    initialState.daysDifference = params.daysDifference;
  }

  return initialState;
}

export function hasValidCoordinatesForMap(data, isInitial = false) {
  //log('utils', `hasValidCoordinatesForMap(), data: ${data} isInitital: ${isInitial}, useLongCoordinates: ${useLongCoordinates}`,{data,useLongCoordinates})
  if (data == null) return false;

  let lat, lon;
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
  } catch (e) {
    rlog(
      "error-coordinates",
      `[utils::hasValidCoordinatesForMap] error in calculating coordinates`,
      e
    );
  }

  //log('utils', `hasValidCoordinatesForMap(), lat/lon: ${lat}/${lon}`,{lat,lon})
  const result = lat != null && lon != null && isNumber(lat) && isNumber(lon);
  //log('utils', `hasValidCoordinatesForMap(), result: ${result}, isInitial: ${isInitial}`,{data,result,lat,lon})

  return result;
}

export function applyHotelsSearchFilter(data, filter) {
  console.time("*** utils::applyHotelsSearchFilter()");

  const doFilter = function(data, type, value, showUnAvailable) {
    const tmp = isString(value) ? value.split(",") : [value];
    const value1 = tmp[0];
    const value2 = tmp.length == 2 ? tmp[1] : null;
    let result = data;

    switch (type) {
      case "orderBy":
        if (value1 == "priceForSort") {
          if (value2 == "asc") {
            result.sort((a, b) => a.price > b.price);
          } else {
            result.sort((a, b) => a.price < b.price);
          }
        } else {
          //log('TODO',`Not implemented filter: '${value1}':'${value2}'   //   TYPE: '${type}'`,null,true)
        }
        break;

      case "nameFilter":
        const nameFilter = value1.toLowerCase();
        if (nameFilter) {
          //log('doFilter-name',`items: ${data?data.length:'n/a'}`,{data})
          result = data.filter(item => {
            if (item && item.name && item) {
              result = item.name.toLowerCase().indexOf(nameFilter) > -1;
            } else {
              result = true;
            }
            return result;
          });
        }
        break;

      case "priceRange":
        const v1 = parseFloat(value[0]);
        const v2 = parseFloat(value[1]);
        result = data.filter(
          item =>
            (v1 <= item.price && item.price <= v2) ||
            (item.price == null && showUnAvailable)
        );
        //log('utils',`Filter priceRange, ${value}`, {value,data,result,v1,v2},true)
        break;

      case "selectedRating":
        let hasStarToFilter = false;
        value.map(
          (item, index) => (hasStarToFilter = item ? true : hasStarToFilter)
        );
        if (hasStarToFilter) {
          result = data.filter(item => value[item.stars - 1]);
        }
        break;

      default:
        //log('TODO',`Not implemented filter: '${value1}':'${value2}'`)   //   TYPE: '${type}'`,null,true)
        break;
    }

    //log('utils',`Filter Applied '${type}', value: '${value}' | in: ${data.length} out: ${result.length}`, {value,data,result},true)

    return result;
  };

  let filtered = data.concat(); // make a shallow copy
  for (let prop in filter) {
    if (prop == "showUnAvailable") {
      // priceRange used for this one
      continue;
    }
    const value = filter[prop];
    filtered = doFilter(filtered, prop, value, filter.showUnAvailable);
  }

  //log('utils',`applyHotelsSearchFilter(): ${filtered.length} / ${data.length}`, {filter,data,result:filtered},true)

  console.timeEnd("*** utils::applyHotelsSearchFilter()");
  return filtered;
}

/**
 * Used while progressively loading first results after getting static data and socket prices
 */
export function hotelsTemporaryFilterAndSort(hotels) {
  // filter out items without price
  let result = hotels.filter(item => !isNaN(item.price));

  // sort by price, ascending
  result.sort((a, b) => a.price > b.price);

  // add index
  if (__DEV__ && showNumberOnHotelItem) {
    result.forEach((item, index) => {
      item.no = index + 1;
      return item;
    });
  }

  return result;
}

/**
 * Gather statistical information from data
 * priceMin, priceMax, newIdsMap,
 * minLat, maxLat, minLon, maxLon
 */
export function processFilteredHotels(
  filtered,
  hotelsOld,
  hotelsOldIdsMap,
  priceMinOld,
  priceMaxOld
) {
  let priceMin = priceMinOld;
  let priceMax = priceMaxOld;
  let newIdsMap = {};
  let minLat, maxLat, minLon, maxLon;

  // calculate min &max price
  filtered.map((item, index) => {
    const { price, latitude, longitude } = item;

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
    return null;
  });

  // process images
  // log('processing',`priceMin:${priceMin}, priceMax:${priceMax}`,{priceMin, priceMax, newIdsMap})

  return {
    priceMin,
    priceMax,
    newIdsMap,
    minLat,
    maxLat,
    minLon,
    maxLon
  };
}

export function generateFilterInitialData(showUnAvailable = false, state) {
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
  const pagination =
    page > -1 ? `&page=${page}&sort=${sort}` : `&page=0&sort=${sort}`;

  const filtersStr = encodeURI(JSON.stringify(filtersObj));
  let filters = `&filters=${filtersStr}${pagination}`; //eslint-disable-line

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
    result.forEach((item, index) => {
      const socketData = socketMap ? socketMap[item.id] : null;
      const staticData = staticMap ? staticMap[item.id] : null;

      // Safe parse hotelData
      let mergedData;
      try {
        mergedData = parseFilterHotelData(item, socketData, staticData);
      } catch (parseError) {
        mergedData = null;
        processError(
          `[HotelsSearch::utils] Parse error in parseFilterHotelData: ${parseError.message}`,
          { parseError, mergedData }
        );
      }

      if (mergedData) {
        mergedData.no = index + 1;
      } else {
        mergedData = item;
      }

      return mergedData;
    });
  } catch (e) {
    processError(
      `[HotelsSearch::utils] Error in mergeAllHotelData: ${e.message}`,
      { error: e, filtered, socketMap, staticMap }
    );
  }
  return result;
}

export function processStaticHotels(
  hotels,
  hotelsStaticCacheMap,
  hotelsIndicesByIdMap,
  hotelsAll,
  isAllHotelsLoaded
) {
  hotels.forEach((item, index) => {
    hotelsStaticCacheMap[item.id] = item;
    checkHotelData(item, "static", index);
    parseStaticHotel(item, index);

    // patch with data
    if (isAllHotelsLoaded) {
      const indexFromCache = hotelsIndicesByIdMap[item.id];
      const itemInList = hotelsAll[indexFromCache];
      if (itemInList) {
        itemInList.hotelPhoto = item.hotelPhoto;
      }
      checkHotelData(itemInList, "static-patched", index);
    }
  });
}

/**
 *  --------------   Parsing Functions ----------------
 * parseStaticHotel(hotels)
 * parseSocketHotelData(socketData, staticData)
 * parseFilterHotelData(filterData,socketData,staticData)
 */

function parseStaticHotel(hotel, index) {
  if (hotel.star != null) delete hotel.star;
  checkHotelData(hotel, "static-parsed", index);
}

/**
 *
 * @param {*} socketData
 * @param {*} staticData
 * @returns (Object) The result has the following properties: {hotelData:Object, initialCoord: {initialLat:Number,initialLon:Number}}
 */
const useLongCoordinates = true; // used in parse functions (long is latitude/longitude and short is lat/lon)
export function parseSocketHotelData(socketData, staticData) {
  let hotelData = Object.assign({}, socketData);
  if (hotelData.lat) {
    delete hotelData.lat;
    delete hotelData.lon;
  }

  // parse images
  const hasSocketPhoto = hasValidImageData(socketData, "hotelPhoto");
  const hasSocketThumb = hasValidImageData(socketData, "thumbnail");
  const hasStaticPhoto = hasValidImageData(staticData, "hotelPhoto");
  const hasStaticThumb = hasValidImageData(staticData, "thumbnail");
  if (!hasSocketPhoto) {
    hotelData.hotelPhoto = hasStaticPhoto
      ? staticData.hotelPhoto
      : hasSocketThumb
      ? socketData.thumbnail
      : hasStaticThumb
      ? staticData.thumbnail
      : DEFAULT_HOTEL_PNG;
  }
  if (!hasSocketThumb) {
    hotelData.thumbnail = hotelData.hotelPhoto;
  }

  const { star, stars } = socketData;

  hotelData.stars =
    star != null ? parseInt(star) : isArray(stars) ? stars.length : stars;
  if (hotelData.stars == null && staticData) {
    const { star: s2, stars: s3 } = staticData;
    hotelData.stars =
      s2 != null ? parseInt(s2) : s3 != null && isArray(s3) ? s3.length : 0;
  }
  if (star) {
    delete hotelData.star;
  }

  // parse coordinates
  let lat = socketData.latitude != null ? socketData.latitude : socketData.lat;
  let lon =
    socketData.longitude != null ? socketData.longitude : socketData.lon;
  lat = lat != null ? parseFloat(lat) : null;
  lon = lon != null ? parseFloat(lon) : null;
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

function parseFilterHotelData(filterData, socketData, staticData) {
  let hotelData = Object.assign(filterData);

  if (isString(hotelData.latitude)) {
    if (useLongCoordinates) {
      hotelData.latitude = parseFloat(hotelData.latitude);
      hotelData.longitude = parseFloat(hotelData.longitude);
    } else {
      hotelData.lat = parseFloat(hotelData.latitude);
      hotelData.lon = parseFloat(hotelData.longitude);
      delete hotelData.latitude;
      delete hotelData.longitude;
    }
  }

  const hasPhoto = hasValidImageData(hotelData, "hotelPhoto");
  const hasThumb = hasValidImageData(hotelData, "thumbnail");
  const hasStaticPhoto = hasValidImageData(staticData, "hotelPhoto");
  const hasSocketThumb = hasValidImageData(socketData, "thumbnail");
  const patchedThumb = hasSocketThumb ? socketData.thumbnail : null;
  if (!hasPhoto)
    hotelData.hotelPhoto = hasStaticPhoto
      ? staticData.hotelPhoto
      : patchedThumb;
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

  // stars
  if (hotelData.star) {
    hotelData.stars = parseInt(hotelData.star);
    delete hotelData.star;
  }

  return hotelData;
}

/**
 * Checks whether data is null, an empty string or an object with
 * a property url null or an empty string
 */
function hasValidImageData(data, type) {
  return !(!data || !data[type] || (isObject(data[type]) && !data[type].url));
}

function newObject(source, extra = null) {
  return lodash.merge({}, source, extra);
}

var checkHotelDataCache = {};
export function checkHotelDataPrepare() {
  if (__DEV__) {
    checkHotelDataCache = {};
  }
}
export function printCheckHotelDataCache() {
  if (__DEV__) {
    try {
      const keys = Object.keys(checkHotelDataCache);
      let totalErrors = 0;
      const summary =
        keys.length == 0
          ? "<empty>"
          : keys
              .map(key => {
                const currentErrorsCount =
                  checkHotelDataCache[key].errors.length;
                totalErrors += currentErrorsCount;
                return `${key}:${currentErrorsCount}`;
              })
              .join("    ");
      if (totalErrors > 0) {
        console.info(`[checkHotelData] Printing errors cache - ${summary}`, {
          checkHotelDataCache
        });
        rlog(
          "X-cache",
          `checkHotelData - ${totalErrors} errors found  -  ${summary}`,
          { checkHotelDataCache },
          true
        );
      } else {
        console.info(`[checkHotelData] Printing errors cache - no errors`);
        rlog("X-cache", `checkHotelData - no errors`);
      }
    } catch (error) {
      processError(`printCheckHotelDataCache - ${error.message}`, { error });
      rlog(
        "X-cache-error",
        `checkHotelData - error printing: ${error.message}`,
        { error },
        true
      );
    }
  }
}

export function checkHotelData(data, type, index) {
  if (
    !__DEV__ ||
    checkHotelsDataWithTemplates == false ||
    (isString(checkHotelsDataWithTemplates) &&
      checkHotelsDataWithTemplates.indexOf(type) == -1)
  ) {
    return;
  }

  const isArrayInstance = data instanceof Array;
  let result = "";
  let props;
  if (!checkHotelDataCache[type]) {
    checkHotelDataCache[type] = { errors: [], errorIndexes: [], success: [] };
  }

  if (isArrayInstance) {
    data.forEach((item, index) => {
      checkHotelData(item, type, index);
    });
  } else {
    let commonData = {
      id: "number",
      name: "string"
    };

    switch (type) {
      case "static":
        props = newObject(commonData, {
          generalDescription: "string",
          hotelPhoto: { url: "string" },
          star: "number"
        });
        result = validateObject(data, props);
        break;

      case "static-parsed":
        props = newObject(commonData, {
          generalDescription: "string",
          hotelPhoto: "object"
        });
        result = validateObject(data, props);
        break;

      case "static-patched":
        props = newObject(commonData, {
          generalDescription: "string",
          hotelPhoto: { url: "string" },
          stars: "number"
        });
        result = validateObject(data, props);
        break;

      case "socket":
        props = newObject(commonData, {
          price: "number",
          // dynamic
          externalId: "number,null",
          longitude: "null,string",
          latitude: "null,string",
          thumbnail: "object,null",
          star: "string,null",
          stars: "number,null",
          lon: "string,null",
          lat: "string,null"
        });
        result = validateObject(data, props);
        break;

      case "socket-parsed":
        props = newObject(commonData, {
          price: "number",
          stars: "number",
          // dynamic
          externalId: "number",
          longitude: "number,null",
          latitude: "number,null",
          hotelPhoto: "string,object", //[{url:'string'},'string'],
          thumbnail: "object,string"
        });
        result = validateObject(data, props);
        break;

      case "filter":
        props = newObject(commonData, {
          star: "number",
          price: "number",
          priceForSort: "number",
          // dynamic
          generalDescription: "string,null",
          longitude: "string,null",
          latitude: "string,null",
          hotelPhoto: "string,null",
          // thumbnail: {url:'string'},
          price: "number,null"
        });
        result = validateObject(data, props);
        break;

      case "filter-parsed":
        props = newObject(commonData, {
          no: "number",
          price: "number",
          priceForSort: "number",
          // required
          stars: "number",
          generalDescription: "null,string",
          longitude: "number,null",
          latitude: "number,null",
          hotelPhoto: "string",
          thumbnail: "string",
          // thumbnail: {url:'string'},
          price: "number,null"
        });
        result = validateObject(data, props);
        break;
    }
  }

  if (result.length > 0) {
    checkHotelDataCache[type].errors.push(result);
    checkHotelDataCache[type].errorIndexes.push(index);
    //rlog(`X-${type}`, `@${result}@, index: ${index} failed: ${isArrayInstance ? failed : 'n/a'}, isArray: ${isArrayInstance}`,{invalid_types:result,data,type,props, isArrayInstance},false);
    //console.warn(`[utils::checkHotelData] @${result}@, index: ${index}`,{result,data,type,props})
  } else {
    checkHotelDataCache[type].success.push({ data, type, index });
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
export function calculateCoordinatesGridPosition(
  lat,
  lon,
  regionLat,
  regionLatDelta,
  regionLon,
  regionLonDelta,
  latStep,
  lonStep
) {
  let regionStartLat = regionLat - regionLatDelta,
    regionEndLat = regionLat + regionLatDelta,
    regionStartLon = regionLon - regionLonDelta,
    regionEndLon = regionLon + regionLonDelta;

  // console.log(`regionLat: ${regionStartLat} / ${regionEndLat} regionLon: ${regionStartLon} / ${regionEndLon}`)

  // quick return if not in range
  if (
    lat < regionStartLat ||
    lat > regionEndLat ||
    lon < regionStartLon ||
    lon > regionEndLon
  ) {
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
      if (
        currentLat >= lat &&
        currentLat < lat + latStep &&
        currentLon >= lon &&
        currentLon < lon + lonStep
      ) {
        result = {
          latIndex,
          lonIndex
        };
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


export function parseGuestInfoToServerFormat(data) {
  let result = [];

  data.forEach(room => {
    let roomInfo = {adults:[], children: []}
    room.forEach(guest => {
      const { age, title, firstName, lastName } = guest;
      const isAChild = (age != null);
      if (isAChild) {
        // roomInfo.children.push({age, firstName, lastName})
        roomInfo.children.push({age})
      } else {
        roomInfo.adults.push({title, firstName, lastName})
      }
    })
    result.push(roomInfo);
  })

  return result;
}