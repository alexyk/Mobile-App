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
        totalHotels : 0,
        pricesFromSocketValid : 0,
        pricesFromSocket : 0,
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

export function updateHotelFromSocket(hotelData, hotelsFromSocketOnly, hotelsIndicesById, prevState, updatedProps) {
    let hotelsInfo = prevState.hotelsInfo;
    let result = hotelsInfo;
    const index = hotelsIndicesById[hotelData.id];
    const indexNotNull = (index != null);
    const current = (indexNotNull && hotelsInfo ? hotelsInfo[index] : {lat:null, lon: null, price: null});
    const infoFromSocket = {
        id: hotelData.id,
        price: !isNaN(hotelData.price) ? hotelData.price : current.price,
        lat: hotelData.lat != null ? hotelData.lat : current.lat,
        lon: hotelData.lon != null ? hotelData.lon : current.lon,
        hotelPhoto: 
            (hotelData.thumbnail && hotelData.thumbnail.url 
                && (current && current.hotelPhoto 
                        && current.hotelPhoto.url
                        && hotelData.thumbnail.url != current.hotelPhoto.url
                )
            )
                ? hotelData.thumbnail
                : current.hotelPhoto        
    }
    if (indexNotNull && hotelsInfo) {
        // TODO: Performance - check if this is too intensive - creating a copy of all hotels
        console.time('Create hotelsInfo copy on socket update');
        let hotelsInfoFresh = [...prevState.hotelsInfo]; // shallow copy, same as Array.slice() ???
        console.timeEnd('Create hotelsInfo copy on socket update');

        // TODO: @@debug - remove
        debugHotelData(hotelData, hotelsInfo, index, '>> SOCKET DATA <<');

        // update selected hotel data from socket data (not all)
        hotelData = Object.assign({},hotelsInfo[index], infoFromSocket);
        hotelsInfoFresh[index] = hotelData;

        result = hotelsInfoFresh;
    } else {
        // hotel data not present in state - add it to socket cache
        // since it was not retrieved by user scrolling down
        hotelsFromSocketOnly[hotelData.id] = infoFromSocket;
    }    

    return result;
}

export function updateHotelsFromSocketCache(hotelsArray, socketCacheMap) {
    hotelsArray.map(
        (item, index) => {
            const cached = socketCacheMap[item.id];
            if (cached) {
                Object.assign(item, cached);
            }
            return item;
        }
    )
}

export function updateHotelIdsMap(targetObject, array) {
    // TODO: Performance - check if this is too intensive
    console.time('Update hotelIdsMap');
    array.map(
        (item, index) => {
            targetObject[item.id] = index;
            return item;
        }
    );
    console.timeEnd('Update hotelIdsMap');
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
        }',` 
    );
}

