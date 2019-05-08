import {
    updateHotelsFromSocketCache,
    updateHotelsFromFilters,
    popSocketCacheIntoHotelsArray,
    parseAndCacheHotelDataFromSocket,
    hasValidCoordinatesForMap,
    applyHotelsSearchFilter,
    processFilteredHotels,
    validateObject,
    calculateCoordinatesGridPosition
} from "../src/components/screens/utils"

test('hasValidCoordinatesForMap', () => {
    // initital coordinates check
    const initCoord = {initialLat: 45.3, initialLon: 67.90}
    let res = hasValidCoordinatesForMap(initCoord, true)
    expect(res).toBeTruthy()
    res = hasValidCoordinatesForMap(initCoord)
    expect(res).toBeFalsy()

    // hotel coordinates check
    const coord = {latitude: 45.3, longitude: 67.90}
    res = hasValidCoordinatesForMap(coord)
    expect(res).toBeTruthy()
    res = hasValidCoordinatesForMap(coord, true)
    expect(res).not.toBeTruthy()
})

test('parseAndCacheHotelDataFromSocket', () => {
    // mock up
    const {hotel1, hotel2, hotelSocket1} = dummyData2();
    // data init
    const hotels = [ hotel1, hotel2 ]
    const idsMap = {1: 0}
    let socketCacheMap = {}

    // the test
    let result = parseAndCacheHotelDataFromSocket(hotelSocket1, socketCacheMap, hotels);

    expect(result.initialLat         )   .toEqual    (77.9)
    expect(result.initialLon         )   .toEqual    (8.7)
    const item = socketCacheMap[hotelSocket1.id];
    expect(item.price                )   .toBe       (12.68)
    expect(item.longitude            )   .toBe       (8.7)
    expect(item.latitude             )   .toBe       (77.9)
    expect(item.name                 )   .toEqual    (undefined)
})

test('updateHotelsFromSocketCache', () => {
    let {
        staticData1, socketData1, socketData2, socketData3,
        hotelsIndicesById, hotelsSocketCacheMap, hotelsInfo
    } = dummyData1()

    let state = {hotelsInfo, hotelsInfoForMap:[]}
    let cacheIds = Object.keys(hotelsSocketCacheMap);

    expect(cacheIds.length)         .toBe(3)

    // ----------------------------- test 1 ----------------------------------
    // testing with socket cache
    let r = updateHotelsFromSocketCache(state, hotelsSocketCacheMap, hotelsIndicesById);

    expect(r.hotelsInfoFresh instanceof Array)          .toBeTruthy()
    expect(r.hotelsInfoFresh.length)                    .toBe(1)
    expect(r.hotelsInfoForMapFresh instanceof Array)    .toBeTruthy()

    expect(r.hotelsInfoForMapFresh.length)            .toBe(1)

    let item1 = r.hotelsInfoFresh[0];
    expect(item1.price)             .toBe(23.9)
    expect(item1.name)              .toEqual("Ala bala")
    expect(item1.thumbnail)   .not  .toEqual(null)
    expect(item1.hotelPhoto)  .not  .toEqual(null)

    cacheIds = Object.keys(hotelsSocketCacheMap);
    expect(cacheIds.length)         .toBe(3) // not deleting any more

    // ----------------------------- test 2 ----------------------------------
    // testing with EMPTY socket cache
    r = updateHotelsFromSocketCache(state, hotelsSocketCacheMap, hotelsIndicesById);

    item1 = r.hotelsInfoFresh[0];
    expect(item1.price)             .toBeDefined()
    expect(item1.price)             .toBeDefined()
});

test('updateHotelsFromFilters', function() {
    const {filtered,ids} = dummyFilterData1()
    const old = dummyHotelsLoaded1()
    const {hotelsFromFilters, indicesById, socketCache} = updateHotelsFromFilters(filtered, old, ids);

    // log(`Param-Filtered`,filtered)
    // log(`Param-Old`, old)
    // log(`Parsed`,hotelsFromFilters)
    // log(`indicesById`,indicesById)

    // to be defined
    expect(hotelsFromFilters)           .toBeDefined()
    expect(indicesById)                 .toBeDefined()
    expect(socketCache)                 .toBeDefined()

    // length
    expect(hotelsFromFilters.length)    .toBeGreaterThanOrEqual(1)
    expect(indicesById[filtered[0].id]) .toBeDefined()
    expect(socketCache[filtered[0].id]) .toBeDefined()

    // item1 properties check
    const item1 = hotelsFromFilters[0]
    expect(item1.name)                  .toBeDefined()
    expect(item1.latitude)              .toBeDefined()
    expect(item1.longitude)             .toBeDefined()
    expect(item1.thumbnail)             .toBeDefined()
    expect(item1.hotelPhoto)            .toBeDefined()
})

test('applyHotelsSearchFilter',function() {
    let {filtered:hotels, ids} = dummyFilterData2()
    expect(hotels.length)      .toEqual(4)

    // log(`ids:`,ids)
    // log(`Hotels`,hotels)

    // let filter1 = {orderBy: 'rank,desc'}
    let filter2 = {orderBy: 'priceForSort,asc'}
    let filter3 = {orderBy: 'priceForSort,desc'}
    let filter4 = {showUnAvailable: true}
    let filter5 = {showUnAvailable: false}
    let filter6 = {selectedRating: [false,false,true,false,false]}
    let filter7 = {priceRange: [10,30]}

    let res;
    //TODO: rank
    // res = applyHotelsSearchFilter(hotels,filter1)

    // low->high price
    res = applyHotelsSearchFilter(hotels,filter2)
    expect(res[0].price < res[1].price && res[1].price < res[2].price)

    res = applyHotelsSearchFilter(hotels,filter3)
    expect(res[0].price > res[1].price && res[1].price > res[2].price)

    // un-available
    res = applyHotelsSearchFilter(hotels,filter4)
    // expect(res.length)      .toEqual(1)
    expect(res.length)      .toEqual(4)

    // available
    res = applyHotelsSearchFilter(hotels,filter5)
    expect(res.length)      .toEqual(4)
    
    // selected rating (stars)
    res = applyHotelsSearchFilter(hotels,filter6)
    expect(res.length)      .toEqual(2)
    
    // price range
    res = applyHotelsSearchFilter(hotels,filter7)
    expect(res.length)      .toEqual(2)
    

    // combined
    res = applyHotelsSearchFilter(hotels,Object.assign(Object.assign({},filter5),filter2))
    expect(res.length)      .toEqual(4)
    expect(res[0].price < res[1].price && res[1].price < res[2].price)

    // log(`Filtered1`,res)
})


test('processFilteredHotels',() => {
    const {filtered, ids} = dummyFilterData2()
    const {hotelsInfo,hotelsIndicesById} = dummyData1()
    const photo1 = {url: "http://photo.la"};
    const thumb1 = {url: "http://photo.la"};
    hotelsInfo[0]['hotelPhoto'] = photo1;
    hotelsInfo[0]['thumbnail'] = thumb1;

    let filtered2 = filtered.concat()

    // execute
    const {newIdsMap,priceMin,priceMax} = processFilteredHotels(filtered2, hotelsInfo, hotelsIndicesById, 5000, 0)

    // log({res,filtered,ids,hotelsInfo,hotelsIndicesById})
    // log({filtered,ids,hotelsInfo,hotelsIndicesById})
    // log(filtered)

    expect(newIdsMap)               .toEqual(ids)
    expect(newIdsMap)       .not    .toEqual(hotelsIndicesById)
    expect({12:0})                  .toEqual(hotelsIndicesById)
    expect(newIdsMap[12])   .not    .toEqual(0)
    expect(newIdsMap[12])           .toEqual(1)
    expect(filtered2[1].id)         .toEqual(12)
    expect(priceMin)                .toEqual(11.07)
    expect(priceMax)                .toEqual(90.89)
})

test('validateObject', () => {
    const props = {hello:'string', la:'null,number', id:'number', price: 'number', photo: {url:'string'}}
    let obj = {hello: 'there', id: 131, price: 3.45, la: null, photo: {url:'blue.png'}}

    let res = validateObject(obj, props)
    expect(res)     .toEqual('')

    // check array
    let obj2 = {hello: 'there2', id: 96, price: 78.4, photo: {url:'green.png'}, la:90}
    res = validateObject([obj,obj2], props)
    // log({res})

        // change some props
    Object.assign(obj, {photo: undefined,price:null})
        // add new props
    obj['descr'] = 'I am a new property'
    obj['obj'] = {}

    res = validateObject(obj, props)
        // convert all EXPECTED ERRORS to @ each
    res = res.replace("price:null;",'@')
    res = res.replace("photo:<null_object>;",'@')
        // convert all NEW PROPERTIES to @ each
    res = res.replace("descr:new_string;",'@')
    res = res.replace("obj:new_object;",'@')
        // remove spaces
    res = res.replace(/ /g,'')
        // expect to have 2 conditions
    expect(res)     .toEqual('@@@@')    
})

test('lodash vs Object.assign',() => {
        // init
    const lodash = require('lodash')
    const objOrig = {hello: 'there', id: 131, price: 3.45, photo: {url:'blue.png'}}
    const obj = Object.assign({},objOrig);
    const objNA = {photo: undefined, na:7};
    const objNA2 = {photo: '', na:789};

        // test 1 - lodash.merge({}, ...)
    const objL1 = lodash.merge( {}, obj, objNA);
    const objL1_2 = lodash.merge( {}, obj, objNA2);
    // const objA = Object.assign({},obj, {photo: undefined})
    // log('lodash.merge({},...)',{obj, objL1, objL1_2})
    const lodashAll = lodash.merge(
    	{name: 'hello', nullDeletesMe: 'he ho'},
    	{id: 23, name: 'second'},
    	{descr: 'hey there'},
    	{photo: 'less.jpg', nullDeletesMe: null, descr: undefined}
//    , 	{id: undefined, descr: undefined},
    )
    log('merge 4 objects', {lodashAll})

        // test 2 - lodash.merge(obj, ...)
    const objL2 = lodash.merge( obj, objNA, objNA2);
    //log('lodash.merge(obj,...)',{obj, objL2})
    //log('Object.assign',)

        // test

})

test('calculateCoordinatesGridPosition - simple', () => {
    let regionLat = 40,
        regionLatDelta = 43,
        regionLon = 20,
        regionLonDelta = 24,
        latStep = 1.1,
        lonStep = 1.1;
    const items = [{lat: 41, lon: 22}, {lat: -10, lon: 68}, {lat: -120, lon: -13}, {lat: 27, lon: -60}];
    items.forEach((item,index) => {
        let result = calculateCoordinatesGridPosition(item.lat, item.lon, regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep);
        //log(`calc item ${index}`, {item, result, regionLat, regionLon, regionLonDelta, regionLatDelta})
        switch (index) {
            case 0:
                expect(result.latIndex).toEqual(1);
                expect(result.lonIndex).toEqual(6);
                break;

            default:
                expect(result).toEqual(null);
                break
        }
    })
})

test('calculateCoordinatesGridPosition - complex', () => {
    let {params, items} = require('./data/map.sofia.json');
    let {regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep} = params;

    console.log(`regionLat: ${regionLat} / ${regionLatDelta} regionLon: ${regionLon} / ${regionLonDelta}`)

    items.forEach((item,index) => {
        let {lat,lon} = item;
        let result = calculateCoordinatesGridPosition(lat, lon, regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep);
        // log(`calc item ${index}`, {item, result, regionLat, regionLon, regionLonDelta, regionLatDelta})
        if (!result) {
            const inLat = (regionLat <= lat && regionLatDelta > lat);
            const inLon = (regionLon <= lon && regionLonDelta > lon);
            //if (inLon && inLat) 
            console.log(`[Skipping ${index}] in-lat:'${inLat}' in-lon:'${inLon}' lat: ${lat.toFixed(4)} lon: ${lon.toFixed(4)}`)
        } else {
            console.log(`          [SUCCESS ${index}] lat: ${lat.toFixed(4)} lon: ${lon.toFixed(4)}`)
        }
        switch (index) {
            case 0:
                //expect(result.latIndex).toEqual(1);
                //expect(result.lonIndex).toEqual(6);
                break;

            default:
                //expect(result).toEqual(null);
                break
        }
    })
})


// ------------------------------------------------------------------------------

function log(title,obj) {
    if (typeof(title) == 'object' || obj == null) {
        console.log(printAny(title))
    } else {
        console.log(`${title} ->`,printAny(obj))
    }
}

function printAny(obj,indent=2) {
    const b = (obj instanceof Array ? '[]' : '{}')
    let out = (`${b[0]}\n`.padStart(indent > 2 ? 2 : 0, ' '));
    let keys = (typeof(obj)=='object' ? Object.keys(obj) : [])
    
    for (let i=0; i<keys.length; i++) {
        const key = keys[i];
        const item = obj[key];
        const type = typeof(item);
        if (item instanceof Object) {
            out += ''.padStart(indent+2, ' ') + key + ': ' + printAny(item, indent+4)
        } else {
            out += ''.padStart(indent+2, ' ') + key +
                (type == 'string'
                    ? `: '${item}',\n`
                    : `: ${item},\n`
                )
        }

    }

    out += (`${b[1]}`.padStart(indent-1, ' '));
    out += (indent == 2 ? "\n" : ",\n")

    return out;
}




//// ----------------------    DATA    ----------------------------
function dummyHotelsLoaded1() {
    let staticData1 = {id:12, name: "Ala bala", hotelPhoto: {url: "http://example.io"}, thumbnail: {url:"http://klj.gk/pic",lat:44.880235, lon:15.987798, price: 23.9}};
    return [staticData1]
}
function dummyFilterData1() {
    let item1 = {id:12, name: "Filtered Item 1", latitude:44.880235, longitude:15.987798, price: 23.9, thumbnail: {url: "http://example.io/filter1"}, star:2};
    let item2 = {id:297, latitude:44.880235, longitude:15.987798, price:11.07, name: "Filtered Item 2", thumbnail: {url: "http://filter.io/snthoesnthu"},star:3};
    return {
        filtered: [item1,item2],
        ids: {12:0}
    }
}
function dummyFilterData2() {
    let {filtered,ids} = dummyFilterData1()
    let fresh = filtered.concat()
    fresh[0].name = 'Hotel Charlston',
    fresh[1].name = 'Hello There Inn',
    fresh.unshift({name:'Vreb-a-lo Hostel', price:90.89,id:15, star:3})
    fresh.push({name:'Full',id:9})
    ids = {15:0,12:1,297:2,9:3}

    return { filtered:fresh, ids }
}
function dummyData1() {
    let staticData1 = {id:12, name: "Ala bala", hotelPhoto: {url: "http://example.io"}};
    let socketData1 = {id:12, latitude:44.880235, longitude:15.987798, price: 23.9, thumbnail: {url: "http://example.io/7777777"}};
    let socketData2 = {id:297, price:11.07, name: "Hello There", thumbnail: {url: "http://lala.io/snthoesnthu"}};
    let socketData3 = {id:9, price:3.04, latitude: 56.3443, lolongituden: 78.09, name: "Same Here", thumbnail: {url: "http://lio.so/kajshd"}};

    let hotelsInfo = [staticData1]
    let hotelsIndicesById = {12: 0}
    let hotelsSocketCacheMap = {12:socketData1, 297:socketData2, 9:socketData3}

    return {
        staticData1,
        socketData1,
        socketData2,
        socketData3,
        hotelsIndicesById,
        hotelsSocketCacheMap,
        hotelsInfo
    }
}
function dummyData2() {
    const hotel1 = {id:1, name: "ala bala"} 
    const hotel2 = {id:2, name: "hello there"} 
    const hotelSocket1 = {id:1, price: 12.68, latitude: 77.9, longitude: 8.7} 

    return {hotel1, hotel2, hotelSocket1}
}
