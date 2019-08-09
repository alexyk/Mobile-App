import { log } from '../common-test-utils'


describe('lodash vs Object.assign',() => {
  const lodash = require('lodash');

  it('initial experiment - merging 4 objects', () => {
        // init
    // const objOrig = {hello: 'there', id: 131, price: 3.45, photo: {url:'blue.png'}}
    // const obj = Object.assign({},objOrig);
    // const objNA = {photo: undefined, na:7};
    // const objNA2 = {photo: '', na:789};

        // test 1 - lodash.merge({}, ...)
    // const objL1 = lodash.merge( {}, obj, objNA);
    // const objL1_2 = lodash.merge( {}, obj, objNA2);
    // const objA = Object.assign({},obj, {photo: undefined})
    // log('lodash.merge({},...)',{obj, objL1, objL1_2})

    const obj1 = {name: 'hello', nullDeletesMe: 'he ho'};
    const obj2 = {id: 23, name: 'second'};
    const obj3 = {descr: 'hey there'};
    const obj4 = {name: 'hello', nullDeletesMe: 'he ho'};
    const lodashAll = lodash.merge(obj1, obj2, obj3, obj4);
    //    , 	{id: undefined, descr: undefined},
    log('merge 4 objects', {lodashAll, obj1, obj2, obj3, obj4})
  });

  it('compare Object.assign() with lodash.merge() for nested objects', () => {
    // make sure to always have fresh objects - by returning from an object generating function
    const o1f = () => ({hello: 'there', id: 131, price: 3.45, photo: {url:'blue.png'}});
    const o2f = () => ({title: 'I am the title', photo: {thumb:'red.JPG'}});

    let o1 = o1f();
    let o2 = o2f();
    const merged = lodash.merge(o1, o2);
    log('lodash.merge(o1,o2)', {o1: o1f(), o2: o2f(), o1_merged: o1, o2_merged: o2, merged, mergedEQo1: (merged === o1)});

    o1 = o1f();
    o2 = o2f();
    const merged2 = Object.assign(o1, o2);
    log('Object.assign(o1, o2)', {o1: o1f(), o2: o2f(), o1_merged: o1, o2_merged: o2, merged2, mergedEQo1: (merged2 === o1)});

        // test
  });

})