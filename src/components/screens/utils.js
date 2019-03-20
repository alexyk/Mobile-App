import moment from "moment"

export function createInitialState(params) {

    const startDate = moment()
    .add(1, 'day');
    const endDate = moment()
        .add(2, 'day');
    
    let roomsData = [{
        adults: 2,
        children: []
    }];

    let initialState = {
        isFilterResult: false,
        search: '',
        cities: [],

        isHotel: true,
        regionId : '',

        hotelsInfo : [],
        allElements: false,
        isMAP : -1,     // TODO: Initial value was -1, is it needed?
                        // Figure out how to work with Map logic and whether this var isMAP is needed
        initialLat: 42.698334,
        initialLon: 23.319941,
        
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

        index: 0,
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

export function updateIds(targetObject, array) {
    array.map(
        (item, index) => {
            targetObject[item.id] = index;
            return item;
        }
    )
}

export function generateSearchString(state, props) {
    let search = `?region=${state.regionId}`;
    search += `&currency=${props.currency}`;
    search += `&startDate=${state.checkInDateFormated}`;
    search += `&endDate=${state.checkOutDateFormated}`;
    search += `&rooms=${state.roomsDummyData}`;
    return search;
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

export function gotoWebview(state, navigation, extraData={}) {
    navigation.navigate('WebviewScreen', {
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
    });
}
