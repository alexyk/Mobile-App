import { autoHotelSearchPlace, log } from '../../config-debug'
import { isObject } from '../../components/screens/utils'

const offlinePacks = {
  sofia: {
		first: require('./offline-responses/sofia-static.json'),
    all: require('./offline-responses/sofia-all.json'),
  },
  paris: {
    first: require('./offline-responses/paris-static.json'),
    all: require('./offline-responses/paris-all.json'),
  },
  paris2: {
    first: require('./offline-responses/paris2-static.json'),
    socket: require('./offline-responses/paris2-socket.json'),
    all: require('./offline-responses/paris2-filtered.json'),
  },
  newYork: {
		first: require('./offline-responses/sofia-static.json'), //TODO: Add NY static
    all: require('./offline-responses/newYork-all.json'),
  },
  araraquara: {
		first: require('./offline-responses/araraquara.json'),
    all: require('./offline-responses/araraquara-all.json'),
    socket: require('./offline-responses/araraquara-socket.json'),
  },
  aalborg: {
		first: require('./offline-responses/aalborg-static.json'),
    all: require('./offline-responses/aalborg-filtered.json'),
    socket: require('./offline-responses/aalborg-socket.json'),
  },
  tokyo: {
		first: require('./offline-responses/tokyo-static.json'),
    all: require('./offline-responses/tokyo-filtered.json'),
    socket: require('./offline-responses/tokyo-socket.json'),
  },
}

export default function createOfflineRequester() {
  console.tron.logImportant('Offline mode (see utils/debug/offline.js)')

	const promiseRes = (data,title) => ({
    body:new Promise(
      function (success,reject) {
        try {
          const keys = Object.keys(data)
          /* let keysStr = keys.map( key => `${key} ` ).join('')
          if (keysStr.length > 70) {
            keysStr = keysStr.substr(0,70) + ' ...'
          }
          const keysDetails = keys.map( key => `${key}:${isObject(data[key])?'{...}':data[key]} ` )
          log('API-OFFLINE', `${title} -> ${keysStr.substr(0,80)}...`, {data,keysDetails} ) */
          log('API-OFFLINE', title, {data})
        } catch (e) {
          log('API-OFFLINE',`ERROR in ${title}: ${e.message}`, {e}, true)
        }
        // console.tron.display({title,value:data})
        success(data);
        //console.tron.display({title,preview:`Success::END`,value:data})
        //console.tron.logImportant('[Offline Requester] reject',args)
      }
    ),
    success:true,
    errors:[]
  })

  const getOfflineResponse = function(title) {
    switch (title) {
      case 'login':                         return require('./offline-responses/login.json')
      case 'getUserInfo':                   return require('./offline-responses/userInfo.json')
      case 'getCountries':                  return require('./offline-responses/countries.json')
      case 'getCurrencyRates':              return require('./offline-responses/rates.json')
      case 'getLocRateByCurrency':          return require('./offline-responses/convert.json')
      case 'getRegionsBySearchParameter':   return jsonRegions
      case 'getStaticHotels':               return offlinePacks[autoHotelSearchPlace].first
      case 'getMapInfo':                    return offlinePacks[autoHotelSearchPlace].all
      case 'getHotelById':                  return require('./offline-responses/hotel1.json')
      case 'getHotelRooms':                 return require('./offline-responses/rooms1.json')
      case 'getConfigVarByName':            return require('./offline-responses/payment-var.json')
      case 'createReservation':             return require('./offline-responses/booking1.json')
      case 'getUserHasPendingBooking':      return require('./offline-responses/booking1-pending.json')
      case 'getListingsByFilter':           return {filteredListings:offlinePacks[autoHotelSearchPlace].first}
      default: {}
    }
  }
    
	const genPromise = (args, title, delay = 0.1) => new Promise(
		(success, reject) => {
      const data = getOfflineResponse(title)
			setTimeout(success, 1000*delay, promiseRes(data,title));
			//console.tron.log(title,`Success::START`,{data,args})
			//console.tron.logImportant(`[${title}] reject`,{args})
		}
  );
  
  const socketDelay = 100; // in milliseconds
	const offlineRequester = {
		// http calls
		login: (...args) 				                => genPromise(args,'login', 0.1),
		getUserInfo: (...args)	                => genPromise(args,'getUserInfo', 0.5),
		getCountries: (...args) 				        => genPromise(args,'getCountries', 0), // with delay 100ms it has an exception
		getCurrencyRates: (...args) 			      => genPromise(args,'getCurrencyRates'),
		getLocRateByCurrency: (...args) 		    => genPromise(args,'getLocRateByCurrency'),
		getRegionsBySearchParameter: (...args) 	=> genPromise(args,'getRegionsBySearchParameter'),
		getStaticHotels: (...args) 				      => genPromise(args,'getStaticHotels',2),
		getMapInfo: (...args) 					        => genPromise(args,'getMapInfo', 15),
		getHotelById: (...args) 					      => genPromise(args,'getHotelById', 0.5),
		getHotelRooms: (...args) 					      => genPromise(args,'getHotelRooms', 0.5),
		getConfigVarByName: (...args) 					=> genPromise(args,'getConfigVarByName'),
		createReservation: (...args) 					  => genPromise(args,'createReservation'),
		getUserHasPendingBooking: (...args) 	  => genPromise(args,'getUserHasPendingBooking'),
    markQuoteIdAsMarked: (...args) 	        => genPromise(args,'getUserHasPendingBooking'),
    // homes
    getListingsByFilter: (...args)          => genPromise(args,'getListingsByFilter', 0.2),
		// socket
		startSocketConnection: (onData,_this) => {
      let arr = require('./offline-responses/fromSocket.json');
      try {
        const tmp = offlinePacks[autoHotelSearchPlace].socket;
        if (tmp) arr = tmp;
      } catch (e) {}

			const delayPerRefresh = socketDelay
			const delay2 = 500
			const delay3 = delay2+300
			arr.map((item,index) => {
				const func = () => {
          onData.apply( _this, [ { body: JSON.stringify(item) } ] )
          log('SOCKET-OFFLINE',`onData ${index}`,{item,index})
        }
				setTimeout(func, index*delayPerRefresh + delay2);

				if (index+1 == arr.length) {
					onDoneSocket.totalElements = arr.length;
					const func2 = () => onData.apply( _this, [ { body: JSON.stringify(onDoneSocket) } ] )
					setTimeout(func2, index*delayPerRefresh+delay3)
				}
			})
    }
  }

  return offlineRequester;
}

// ------- data ---------

const locAmount = {fiatAmount: "1000", params: {locAmount: 1323.7014764150367}, error: undefined}
const jsonRegions = [{"id": 15664,"query": "Sofia, Bulgaria"}]
let onDoneSocket = {
  "totalElements": 45,
  "allElements": true
}
