import {log,printAny} from './common-test-utils'
import { validateObject } from '../src/components/screens/utils'

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
