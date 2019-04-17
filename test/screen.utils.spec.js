import {
    updateHotelsFromSocketCache,
    updateHotelsFromFilters,
    popSocketCacheIntoHotelsArray,
    parseAndCacheHotelDataFromSocket,
    hasValidCoordinatesForMap,
} from "../src/components/screens/utils"


test('hasValidCoordinatesForMap', () => {
    // initital coordinates check
    const initCoord = {initialLat: 45.3, initialLon: 67.90}
    let res = hasValidCoordinatesForMap(initCoord, true)
    expect(res).toBeTruthy()
    res = hasValidCoordinatesForMap(initCoord)
    expect(res).toBeFalsy()

    // hotel coordinates check
    const coord = {lat: 45.3, lon: 67.90}
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
    expect(item.lon                  )   .toBe       (8.7)
    expect(item.lat                  )   .toBe       (77.9)
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

    expect(r.hotelsInfoForMapFresh.length)              .toBe(1)

    let item1 = r.hotelsInfoFresh[0];
    expect(item1.price)             .toBe(23.9)
    expect(item1.name)              .toEqual("Ala bala")
    expect(item1.thumbnail)   .not  .toEqual(null)
    expect(item1.hotelPhoto)  .not  .toEqual(null)

    cacheIds = Object.keys(hotelsSocketCacheMap);
    expect(cacheIds.length)         .toBe(2)

    // ----------------------------- test 2 ----------------------------------
    // testing with EMPTY socket cache
    r = updateHotelsFromSocketCache(state, hotelsSocketCacheMap, hotelsIndicesById);

    item1 = r.hotelsInfoFresh[0];
    expect(item1.price)             .toBe(undefined)
    expect(item1.price)             .toBe(undefined)
});

test('updateHotelsFromFilters', function() {
    const {hotelsInfo} = dummyData1()
    const {hotelsFromFilters, indicesById, socketCache} = updateHotelsFromFilters(hotelsInfo);

    // console.log(`Filtered: ${printAny(hotelsFromFilters)}`)
    // console.log(`indicesById: ${printAny(indicesById)}`)

    // to be defined
    expect(hotelsFromFilters)           .toBeDefined()
    expect(indicesById)                 .toBeDefined()
    expect(socketCache)                 .toBeDefined()

    // length
    expect(hotelsFromFilters.length)    .toBeGreaterThanOrEqual(1)
    expect(indicesById[hotelsInfo[0].id]).toBeDefined()
    expect(socketCache[hotelsInfo[0].id]).toBeDefined()
})


// ------------------------------------------------------------------------------
// TODO: Finish this - instead of object it prints normal Object.toString()
// function printAny(item) {
//     if (item instanceof Array) {
//         item.forEach((element) => printAny(element))
//         return `[${item.join(', ')}]`
//     } else if (item instanceof Object) {
//         return printAny(item);
//     } else {
//         return item.toString();
//     }
// }


function printAny(obj,indent=2) {
    const b = (obj instanceof Array ? '[]' : '{}')
    let out = (`${b[0]}\n`.padStart(indent > 2 ? 2 : 0, ' '));
    let keys = Object.keys(obj)
    
    for (let i=0; i<keys.length; i++) {
        const key = keys[i];
        const item = obj[key];
        if (item instanceof Object) {
            out += ''.padStart(indent+2, ' ') + key + ': ' + printAny(item, indent+4)
        } else {
            out += ''.padStart(indent+2, ' ') + key + `: ${item},\n`
        }

    }

    out += (`${b[1]}`.padStart(indent-1, ' '));
    out += (indent == 2 ? "\n" : ",\n")

    return out;
}




//// ----------------------    DATA    ----------------------------
function dummyData1() {
    let staticData1 = {id:12, name: "Ala bala", hotelPhoto: {url: "http://example.io"}};
    let socketData1 = {id:12, lat:44.880235, lon:15.987798, price: 23.9, thumbnail: {url: "http://example.io/7777777"}};
    let socketData2 = {id:297, price:23.89, name: "Hello There", thumbnail: {url: "http://lala.io/snthoesnthu"}};
    let socketData3 = {id:9, price:3.04, lat: 56.3443, lon: 78.09, name: "Same Here", thumbnail: {url: "http://lio.so/kajshd"}};

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
    const hotelSocket1 = {id:1, price: 12.68, lat: 77.9, lon: 8.7} 

    return {hotel1, hotel2, hotelSocket1}
}
