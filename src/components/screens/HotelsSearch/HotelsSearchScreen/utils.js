import moment from "moment"

export const getHotelIndex = function(hotelsInfo, id) {
    const index = (hotelsInfo != null) 
        ? hotelsInfo.findIndex(h => (h && h.id ) ? h.id === id : false)
        : null;

    return index;
}


export const createInitialState = function (params) {
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
        isMAP : 0,      // TODO: Initial value was -1, is it needed?
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

export const processHotelsData = function(data, hotelsInfoById) {
    console.log('[HotelsSearchScreen/utils.js] processHotelsData', {data, hotelsInfoById});

    const { content } = data;
    content.forEach(item => {
        if (hotelsInfoById[item.id]) {
            item.price = this.hotelsInfoById[item.id].price;
        }
    });

    return content;
} 