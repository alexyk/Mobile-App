import {log,printAny} from './common-test-utils'
import { validateObject, processGuestsData } from '../src/components/screens/utils'

test('validateObject', () => {
	const props = {hello:'string', la:'null,number', id:'number', price: 'number', photo: {url:'string'}}
	let obj = {hello: 'there', id: 131, price: 3.45, la: null, photo: {url:'blue.png'}}

	let res = validateObject(obj, props)
	expect(res)	 .toEqual('')

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
	expect(res)	 .toEqual('@@@@')	
})

describe('processGuestsData', () => {
	let res, rooms, adults, children;

	describe('1 room', () => {
		describe('no children', () => {
			it('1 adult', () => {
				rooms = 1;
				adults = 1;
				children = [[]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			      .toBeDefined();
				expect(res.length)	  .toEqual(1);
				expect(res)			      .toEqual([{adults: 1, children: []}]);
			});

			it('2 adults', () => {
				adults = 2;
				rooms = 1;
				children = [[]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			      .toBeDefined();
				expect(res.length)	  .toEqual(1);
				expect(res)			      .toEqual([{adults: 2, children: []}]);
			});

			it('3 adults', () => {
				adults = 3;
				rooms = 1;
				children = [[]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			      .toBeDefined();
				expect(res.length)	  .toEqual(1);
				expect(res)			      .toEqual([{adults: 3, children: []}]);
			});

			it('5 adults', () => {
				adults = 5;
				rooms = 1;
				children = [[]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			      .toBeDefined();
				expect(res.length)	  .toEqual(1);
				expect(res)			      .toEqual([{adults: 5, children: []}]);
			});
		});

		describe('with children', () => {
			it('1 adult, 2 children', () => {
				adults = 1;
				rooms = 1;
				children = [[1,2]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			      .toBeDefined();
				expect(res.length)	  .toEqual(1);
				expect(res)			      .toEqual([{adults: 1, children: [1,2]}]);
			});

			it('2 adults, 4 children', () => {
				adults = 2;
				rooms = 1;
				children = [[1,2,13,16]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			      .toBeDefined();
				expect(res.length)	  .toEqual(1);
				expect(res)			      .toEqual([{adults: 2, children: [1,2,13,16]}]);
			});

			it('5 adults, 4 children', () => {
				adults = 5;
				rooms = 1;
				children = [[1,2,13,16]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			      .toBeDefined();
				expect(res.length)	  .toEqual(1);
				expect(res)			      .toEqual([{adults: 5, children: [1,2,13,16]}]);
			});
		});
	});
	
	describe('2 rooms', () => {
		describe('no children', () => {
			it('2 adults', () => {
				rooms = 2;
				adults = 2;
				children = [[],[]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			      .toBeDefined();
				expect(res.length)	  .toEqual(2);
				expect(res)			      .toEqual([{adults: 1, children: []},{adults: 1, children: []}]);
			});

			it('5 adults', () => {
				rooms = 2;
				adults = 5;
				children = [[],[]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			      .toBeDefined();
				expect(res.length)	  .toEqual(2);
				expect(res)			      .toEqual([{adults: 3, children: []},{adults: 2, children: []}]);
			});
		});

		describe('with children', () => {
			it('2 adults, 3 children', () => {
				rooms = 2;
				adults = 2;
				children = [[7],[3,10]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			        .toBeDefined();
				expect(res.length)	    .toEqual(2);
				expect(res)			      	.toEqual([{adults: 1, children: [7]},{adults: 1, children: [3,10]}]);
			});

			it('4 adults, 4 children', () => {
				rooms = 2;
				adults = 4;
				children = [[7,12],[3,10]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			        .toBeDefined();
				expect(res.length)	    .toEqual(2);
				expect(res)			      	.toEqual([{adults: 2, children: [7,12]},{adults: 2, children: [3,10]}]);
			});

			it('5 adults, 4 children', () => {
				rooms = 2;
				adults = 5;
				children = [[7,12],[3,10]];
				res = processGuestsData(adults, rooms, children);

				expect(res)			        .toBeDefined();
				expect(res.length)	    .toEqual(2);
				expect(res)			      	.toEqual([{adults: 3, children: [7,12]},{adults: 2, children: [3,10]}]);
			});
		});
  });

		describe('5 rooms', () => {
			describe('no children', () => {
				it('5 adults', () => {
					rooms = 5;
					adults = 5;
					children = [[],[],[],[],[]];
					res = processGuestsData(adults, rooms, children);

					expect(res)			      .toBeDefined();
					expect(res.length)	  .toEqual(5);
					expect(res)						.toEqual([
            { adults: 1, children: [] },
            { adults: 1, children: [] },
            { adults: 1, children: [] },
            { adults: 1, children: [] },
            { adults: 1, children: [] }
          ]);
				});
			});

			describe('with children', () => {
				it('5 adults, 6 children', () => {
					rooms = 5;
					adults = 5;
					children = [[1,8],[10,15],[],[7,8],[]];
					res = processGuestsData(adults, rooms, children);

					expect(res)			      .toBeDefined();
					expect(res.length)	  .toEqual(5);
					expect(res)						.toEqual([
            { adults: 1, children: [1, 8] },
            { adults: 1, children: [10, 15] },
            { adults: 1, children: [] },
            { adults: 1, children: [7, 8] },
            { adults: 1, children: [] }
          ]);
				});

				it('10 adults, 10 children', () => {
					rooms = 5;
					adults = 10;
					children = [[1,8],[10],[8],[8,9,6,7],[12,15]];
					res = processGuestsData(adults, rooms, children);

					expect(res)			      .toBeDefined();
					expect(res.length)	  .toEqual(5);
					expect(res)						.toEqual([
            { adults: 2, children: [1, 8] },
            { adults: 2, children: [10] },
            { adults: 2, children: [8] },
            { adults: 2, children: [8, 9, 6, 7] },
            { adults: 2, children: [12, 15] }
          ]);
				});
			});
		});

});
