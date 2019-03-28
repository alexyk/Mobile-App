import {updateHotelFromSocket,popSocketCacheIntoHotelsArray,
    cacheHotelFromSocket
} from "../src/components/screens/utils"

test('cacheHotelFromSocket', () => {
    // mock up
    const hotel1 = {id:1, name: "ala bala"} 
    const hotel2 = {id:2, name: "hello there"} 
    const hotelSocket1 = {id:1, price: 12.68, lat: 77.9, lon: 8.7} 
    // data init
    const hotels = [ hotel1, hotel2 ]
    const map = {1: 0}
    let map2 = {}

    // the test
    cacheHotelFromSocket(hotelSocket1, map2, hotels);
    const result = map2;
    expect(result[hotelSocket1.id].price).toBe(12.68)
    expect(result[hotelSocket1.id].lon).toBe(8.7)
    expect(result[hotelSocket1.id].lat).toBe(77.9)
    expect(result[hotelSocket1.id].name).toEqual(undefined)
    expect(result[hotelSocket1.id].price).toBe(12.68)
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
    let staticData = {id: 12, name: "Ala bala", thumbnail: {url: "http://example.io"}};
    let socketData = {id:12, hotelPhoto: {url: "http://example.io/7777777"}};
    let hotelsFromSocketOnly = {} 
    let hotelsIndicesById = {12: 0}
    let prevState = {hotelsInfo: [socketData]}
    let updatedProps = {};

    let result = updateHotelFromSocket(staticData, hotelsFromSocketOnly, hotelsIndicesById, prevState, updatedProps);

    expect(result instanceof Array).toBeTruthy()
    expect(result.length).toBe(1)

    let item1 = result[0];
    expect(item1.price).toBe(undefined)

    socketData.price = 12.89;
    result = updateHotelFromSocket(staticData, hotelsFromSocketOnly, hotelsIndicesById, prevState, updatedProps);

    console.log(result)
    item1 = result[0];
    expect(item1.price).not.toBe(undefined)
    expect(item1.price).not.toBe(undefined)
});
