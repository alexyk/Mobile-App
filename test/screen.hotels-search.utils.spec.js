import {
    hasValidCoordinatesForMap,
    applyHotelsSearchFilter,
    processFilteredHotels,
    processStaticHotels,
    calculateCoordinatesGridPosition
} from "../src/components/screens/HotelsSearch/utils"
import {
    validateObject,
} from "../src/components/screens/utils"
import {log,printAny} from './common-test-utils'

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


test('calculateCoordinatesGridPosition - simple', () => {
    let regionLat = 40,
        regionLatDelta = 3,
        regionLon = 20,
        regionLonDelta = 4,
        latStep = 1.1,
        lonStep = 1.1;
    const items = [{lat: 41, lon: 22}, {lat: -10, lon: 68}, {lat: -120, lon: -13}, {lat: 27, lon: -60}];
    items.forEach((item,index) => {
        let result = calculateCoordinatesGridPosition(item.lat, item.lon, regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep);
        //log(`calc item ${index}`, {item, result, regionLat, regionLon, regionLonDelta, regionLatDelta})
        switch (index) {
            case 0:
                expect(result.latIndex).toEqual(4);
                expect(result.lonIndex).toEqual(38);
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

    //console.log(`regionLat: ${regionLat} / ${regionLatDelta} regionLon: ${regionLon} / ${regionLonDelta}`)

    items.forEach((item,index) => {
        let {lat,lon} = item;
        let result = calculateCoordinatesGridPosition(lat, lon, regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep);
        // log(`calc item ${index}`, {item, result, regionLat, regionLon, regionLonDelta, regionLatDelta})
        if (!result) {
            const inLat = (regionLat <= lat && regionLatDelta > lat);
            const inLon = (regionLon <= lon && regionLonDelta > lon);
            //if (inLon && inLat) 
            //console.log(`[Skipping ${index}] in-lat:'${inLat}' in-lon:'${inLon}' lat: ${lat.toFixed(4)} lon: ${lon.toFixed(4)}`)
        } else {
            //console.log(`          [SUCCESS ${index}] lat: ${lat.toFixed(4)} lon: ${lon.toFixed(4)}`)
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

test('processStaticHotels', () => {
    const {filtered, ids} = dummyFilterData2()
    let hotelsMap = {};
    let indexes = {};
    let hotelsAll = [];
    const result = processStaticHotels(filtered, hotelsMap, indexes, hotelsAll, false)
    // log({result,filtered});
    expect(filtered)            .toBeDefined()
    expect(filtered.length)     .toEqual(4)
    expect(result)              .toBeDefined()
    expect(result.length)       .toEqual(3)
    expect(result[0].price)     .toBeLessThan(result[1].price)
    expect(result[1].price)     .toBeLessThan(result[2].price)
})


//// ----------------------    DATA    ----------------------------
function dummyHotelsLoaded1() {
    let staticData1 = {id:12, name: "Ala bala", hotelPhoto: {url: "http://example.io"}, thumbnail: {url:"http://klj.gk/pic",lat:44.880235, lon:15.987798, price: 23.9}};
    return [staticData1]
}
function dummyFilterData1() {
    let item1 = {id:12, name: "Filtered Item 1", latitude:44.880235, longitude:15.987798, price: 23.9, thumbnail: {url: "http://example.io/filter1"}, stars:2};
    let item2 = {id:297, latitude:44.880235, longitude:15.987798, price:11.07, name: "Filtered Item 2", thumbnail: {url: "http://filter.io/snthoesnthu"},stars:3};
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
