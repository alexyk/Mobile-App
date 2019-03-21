import {updateHotelFromSocket} from "../src/components/screens/utils"

test('updateHotelFromSocket', () => {
    const staticData = {id: 12, name: "Ala bala", thumbnail: {url: "http://example.io"}};
    const socketData = {...staticData, hotelPhoto: {url: "http://example.io/7777777"}};
    const hotelsFromSocketOnly = {} 
    const hotelsIndicesById = {12: 0}
    const prevState = {hotelsInfo: [socketData]}
    const updatedProps = {};

    let result = updateHotelFromSocket(staticData, hotelsFromSocketOnly, hotelsIndicesById, prevState, updatedProps);

    expect(result instanceof Array).toBeTruthy()
    expect(result.length).toBe(1)

    let item1 = result[0];
    expect(item1.price).toBe(undefined)

    staticData.price = 12.89;
    result = updateHotelFromSocket(staticData, hotelsFromSocketOnly, hotelsIndicesById, prevState, updatedProps);

    item1 = result[0];
    expect(item1.price).not.toBe(undefined)
    expect(item1.price).not.toBe(NaN)
});
