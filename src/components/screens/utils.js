import { basePath } from "../../config";
import { StyleSheet } from "react-native";
import navigationService from "../../services/navigationService";
import { isObject, isArray, isNumber, isString } from "js-tools";
import { validatePhone } from "../../utils/validation";
import { wlog } from "../../utils/debug/debug-tools";


export function validateObject(sourceData, props, index = -1, path = "") {
  let result = "";
  const space = "  ";

  if (sourceData == null) {
    result = `<null_object>;` + space;
  } else if (!isObject(sourceData)) {
    result = `<not_an_object>_${typeof sourceData};` + space;
  }
  if (result.length > 0) {
    if (path.length > 0) {
      return `${path}:${result}`;
    } else {
      return result;
    }
  }

  let data = Object.assign({}, sourceData); // create a copy to remove used props thus leave new only
  const na = "__n/a__";

  if (path.length > 0) path += ".";

  for (let n in props) {
    const item = data.hasOwnProperty(n) ? data[n] : na;
    let type1 = props[n];
    let type2 = item !== null ? typeof item : "null";
    let doDelete = true;

    let types;
    if (isArray(type1)) {
      types = type1;
      if (types.indexOf(type2) > -1) {
        // nothing to do
      } else {
        //TODO: Implement Array of types
        /*let is
        if (condition) {
          
        }*/
        result += `${path}${n}:not_in_[${[type1.join(",")]}]_${type2};` + space;
      }
    } else if (isString(type1) && type1.indexOf(",") > 0) {
      types = type1.split(",");
      if (types.indexOf(type2) > -1) {
        // nothing to do
      } else {
        result += `${path}${n}:not_in_[${type1}]_${type2};` + space;
      }
    } else if (type1 == "any") {
      // nothing to do
    } else if (item == na) {
      result += `${path}${n}:na_${type1};` + space;
      doDelete = false;
    } else if (isObject(type1)) {
      result += validateObject(item, type1, -1, `${n}`);
    } else if (type2 == "string" && item.length == 0) {
      result += `${path}${n}:empty_str;` + space;
    } else if (type2 == "number") {
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
    const type2 = typeof data[n];
    result += `${n}:new_${type2};` + space;
  }

  if (result.length > 0) {
    // remove last space
    result = result.substr(0, result.length - space.length);
  }

  return result;
}

export function generateSearchStringFromAll(obj) {
  let search = `?`;
  for (let prop in obj) {
    search += `&${prop}=${obj[prop]}`;
  }

  return search;
}

export function generateSearchString(state, props, doDecodeRooms = false) {
  let search = `?region=${state.regionId}`;
  search += `&currency=${props.currency}`;
  search += `&startDate=${state.checkInDateFormated}`;
  search += `&endDate=${state.checkOutDateFormated}`;

  if (state.roomsDummyData) {
    if (doDecodeRooms) {
      search += `&rooms=${decodeURI(state.roomsDummyData)}`;
    } else {
      search += `&rooms=${state.roomsDummyData}`;
    }
  }

  search += "&nat=-1";

  return search;
}

export function generateWebviewInitialState(
  params,
  state = null,
  skipWebViewURL = false
) {
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
    currency: params.currency ? params.currency : state ? state.currency : null,
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

  if (skipWebViewURL) {
    if (params.webViewUrl) {
      initialState.webViewUrl = params.webViewUrl;
    }
  } else {
    const webViewUrl =
      basePath +
      (params.webViewUrl
        ? params.webViewUrl
        : generateWebviewUrl(
            initialState,
            roomsDummyData,
            params && params.baseUrl ? params.baseUrl : null
          ));

    initialState.webViewUrl = webViewUrl;
  }

  console.info(
    `[utils::generateWebviewInitialState] webViewUrl: ${initialState.webViewUrl}`,
    { webViewUrl: initialState.webViewUrl, initialState, params, state }
  );

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

    if (rooms) {
      result += "&rooms=" + decodeURI(rooms);
    }
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
    roomsDummyData: state.roomsDummyData,
    email: state.email,
    token: state.token,
    search: state.search,
    ...extraData
  };
}

export function gotoWebview(
  state,
  navigation,
  extraData = {},
  useCachedSearchString = false
) {
  navigation.navigate("WebviewScreen", {
    ...getWebviewExtraData(state, extraData),
    useCachedSearchString
  });
}

/**
 * 
 * @param {Object} simpleParams The object has the following properties: {body, url, message, injectJS, injectedJS}
 */
export function gotoWebviewSimple(simpleParams) {
  navigationService.navigate("WebviewScreen", { simpleParams });
}

export function processGuestsData(adults, rooms, childrenAgeValuesByRoom) {
  let result = [];
  let averageAdults = Math.floor(adults/rooms);
  let firstRoomAdults = (averageAdults + (adults % rooms));

  childrenAgeValuesByRoom.forEach((item, index) => {
    result.push({
      adults: (index == 0 ? firstRoomAdults : averageAdults),
      children: item
    });
  });

  return result;
}

export function stringifyRoomsData(roomsData) {
  const result = encodeURI(JSON.stringify(roomsData));

  return result;
}

export function styleToNumber(style) {
  if (style == null) {
    return null;
  }

  if (isNumber(style)) {
    return style;
  } else {
    return StyleSheet.create({ style }).style;
  }
}

/**
 * Intended to be the only place for processing phone input
 * @param {PhoneInput} phoneInputInstance An instance of react-native-phone-input
 * @param {String} value The phone value as string
 * @param {String} origValue Optional - not currently tested
 */
export function processPhoneInput(phoneInputInstance, value, origValue='') {
  let isValid = validatePhone(value);
  let formattedValue, dialCode;
  
  if (phoneInputInstance) {
    formattedValue = phoneInputInstance.getValue();
    dialCode = phoneInputInstance.getDialCode();
  } else {
    wlog("[screens::utils] Warning: couldn't get phoneInputInstance in processPhoneInput()")
  }

  if (!value || !validatePhone(value) || value.charAt(0) != '+') {
    value = formattedValue || dialCode || origValue;
    // (origValue) && (origValue.charAt(0) != "+") && (value += origValue);
  }  

  return { isValid, value };
}