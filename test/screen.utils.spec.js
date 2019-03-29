import {
    updateHotelsInfoStateFromSocket,
    popSocketCacheIntoHotelsArray,
    cacheHotelFromSocket
} from "../src/components/screens/utils"

test('cacheHotelFromSocket', () => {
    // mock up
    const hotel1 = {id:1, name: "ala bala"} 
    const hotel2 = {id:2, name: "hello there"} 
    const hotelSocket1 = {id:1, price: 12.68, lat: 77.9, lon: 8.7} 
    // data init
    const hotels = [ hotel1, hotel2 ]
    const idsMap = {1: 0}
    let socketCacheMap = {}

    // the test
    cacheHotelFromSocket(hotelSocket1, socketCacheMap, hotels);

    expect(socketCacheMap[hotelSocket1.id].price)   .toBe   (12.68)
    expect(socketCacheMap[hotelSocket1.id].lon  )   .toBe   (8.7)
    expect(socketCacheMap[hotelSocket1.id].lat  )   .toBe   (77.9)
    expect(socketCacheMap[hotelSocket1.id].name )   .toEqual(undefined)
    expect(socketCacheMap[hotelSocket1.id].price)   .toBe   (12.68)
})


test('popSocketCacheIntoHotelsArray', () => {
    // mock up
    const hotel1 = {id:1, name: "ala bala"} 
    const hotel2 = {id:1, name: "hello there"} 
    const hotelSocket1 = {id:1, price: 12.68, lat: 77.9, lon: 8.7} 
    // data init
    const hotels = [ hotel1, hotel2 ]
    const fromSocket = {1: hotelSocket1}
    const map = {1: 0}

    // the test
    const result = popSocketCacheIntoHotelsArray(hotels, fromSocket, map);

    expect(result[0].price).toBe(12.68)
    expect(result[0].lon).toBe(8.7)
    expect(result[0].lat).toBe(77.9)

    expect(result[1].name).toBe("hello there")
    expect(result[1].price).toBe(undefined)
});

test('updateHotelFromSocket', () => {
});

test('updateHotelsInfoStateFromSocket', () => {
    let staticData  = {id:12, name: "Ala bala", hotelPhoto: {url: "http://example.io"}};
    let socketData  = {id:12, lat:44.880235, lon:15.987798, price: 23.9, thumbnail: {url: "http://example.io/7777777"}};
    let socketData2 = {id:297, price:23.89, thumbnail: {url: "http://lala.io/snthoesnthu"}};

    let hotelsIndicesById = {12: 0}
    let hotelsInfo = [staticData]
    let hotelsSocketCacheMap = {12:socketData, 297:socketData2}
    let cacheIds = Object.keys(hotelsSocketCacheMap);

    expect(cacheIds.length)         .toBe(2)

    // ----------------------------- test 1 ----------------------------------
    let result = updateHotelsInfoStateFromSocket(hotelsInfo, hotelsSocketCacheMap, hotelsIndicesById);
    

    expect(result instanceof Array) .toBeTruthy()
    expect(result.length)           .toBe(1)

    let item1 = result[0];
    expect(item1.price)             .toBe(23.9)

    cacheIds = Object.keys(hotelsSocketCacheMap);
    expect(cacheIds.length)         .toBe(1)    // no no no

    // ----------------------------- test 2 ----------------------------------
    socketData.price = 12.89;
    result = updateHotelsInfoStateFromSocket(hotelsInfo, hotelsSocketCacheMap, hotelsIndicesById);

    item1 = result[0];
    expect(item1.price)     .not    .toBe(undefined)
    expect(item1.price)             .toBe(23.9)
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