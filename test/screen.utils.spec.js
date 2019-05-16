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

test.skip('lodash vs Object.assign',() => {
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