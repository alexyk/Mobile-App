import {
    updateHotelsFromSocketCache,
    popSocketCacheIntoHotelsArray,
    parseAndCacheHotelDataFromSocket
} from "../src/components/screens/utils"

test('parseAndCacheHotelDataFromSocket', () => {
    // mock up
    const hotel1 = {id:1, name: "ala bala"} 
    const hotel2 = {id:2, name: "hello there"} 
    const hotelSocket1 = {id:1, price: 12.68, lat: 77.9, lon: 8.7} 
    // data init
    const hotels = [ hotel1, hotel2 ]
    const idsMap = {1: 0}
    let socketCacheMap = {}

    // the test
    parseAndCacheHotelDataFromSocket(hotelSocket1, socketCacheMap, hotels);

    expect(socketCacheMap[hotelSocket1.id].price    )   .toBe   (12.68)
    expect(socketCacheMap[hotelSocket1.id].longitude)   .toBe   (8.7)
    expect(socketCacheMap[hotelSocket1.id].latitude )   .toBe   (77.9)
    expect(socketCacheMap[hotelSocket1.id].name     )   .toEqual(undefined)
    expect(socketCacheMap[hotelSocket1.id].price    )   .toBe   (12.68)
})

test('updateHotelsFromSocketCache', () => {
    let staticData  = {id:12, name: "Ala bala", hotelPhoto: {url: "http://example.io"}};
    let socketData  = {id:12, latitude:44.880235, longitude:15.987798, price: 23.9, thumbnail: {url: "http://example.io/7777777"}};
    let socketData2 = {id:297, price:23.89, thumbnail: {url: "http://lala.io/snthoesnthu"}};

    let hotelsIndicesById = {12: 0}
    let hotelsInfo = [staticData]
    let hotelsSocketCacheMap = {12:socketData, 297:socketData2}
    let cacheIds = Object.keys(hotelsSocketCacheMap);

    expect(cacheIds.length)         .toBe(2)

    // ----------------------------- test 1 ----------------------------------
    // testing with socket cache
    let result = updateHotelsFromSocketCache(hotelsInfo, hotelsSocketCacheMap, hotelsIndicesById);    

    expect(result instanceof Array) .toBeTruthy()
    expect(result.length)           .toBe(1)

    let item1 = result[0];
    expect(item1.price)             .toBe(23.9)
    expect(item1.name)              .toEqual("Ala bala")

    cacheIds = Object.keys(hotelsSocketCacheMap);
    expect(cacheIds.length)         .toBe(1)    // no no no

    // ----------------------------- test 2 ----------------------------------
    // testing with EMPTY socket cache
    result = updateHotelsFromSocketCache(hotelsInfo, hotelsSocketCacheMap, hotelsIndicesById);

    item1 = result[0];
    expect(item1.price)             .toBe(undefined)
    expect(item1.price)             .toBe(undefined)
});




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