import { autoHotelSearchPlace, autoHomeSearchPlace, rlog, processError, validationStateOfflineWallet, offlineTimeInSeconds } from '../../config-debug'
import { isObject } from '../../components/screens/utils'

const offlinePacksHomes = {
  'uk1': require('./offline-responses/homes-uk-1.json'),
  'uk2': require('./offline-responses/homes-uk-2.json'),
}
const offlinePacksHotels = {
  london: {
		first: require('./offline-responses/london-static-0.json'),
		socket: require('./offline-responses/london-socket.json'),
    all: require('./offline-responses/london-filtered.json'),
  },
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
  console.info('Offline mode (see utils/debug/offline.js)')

	const promiseRes = (data,title) => ({
    body:new Promise(
      function (success,reject) {
        try {
          const keys = (isObject(data) ? Object.keys(data) : [typeof(data)])
          let keysStr = keys.map( key => `${key} ` ).join('')
          if (keysStr.length > 70) {
            keysStr = keysStr.substr(0,70) + ' ...'
          }
          const keysDetails = keys.map( key => `${key}:${isObject(data[key])?'{...}':data[key]} ` )
        
          // log('API-OFFLINE', `${title} -> ${keysStr.substr(0,80)}...`, {data,keysDetails,keys} )
          rlog('API-OFFLINE', `${title}`, {data,keysDetails,keys,keysStr} )
          // log('API-OFFLINE', title, {data})
        } catch (e) {
          rlog('API-OFFLINE',`ERROR in ${title}: ${e.message}`, {e}, true)
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
      case 'getUserInfo':                   return (value =>
        {
          switch (value) {
            case -1: return require('./offline-responses/userInfo.json')
            case  0: return require('./offline-responses/userInfo-with-invalid-wallet.json')
            case  1: return require('./offline-responses/userInfo-with-wallet.json')
          }
        })(validationStateOfflineWallet)
      case 'getCountries':                  return require('./offline-responses/countries.json')
      case 'getCurrencyRates':              return require('./offline-responses/rates.json')
      case 'getLocRateByCurrency':          return require('./offline-responses/convert.json')
      case 'getRegionsBySearchParameter':   return jsonRegions
      case 'getStaticHotels':               return offlinePacksHotels[autoHotelSearchPlace].first
      case 'getMapInfo':                    return offlinePacksHotels[autoHotelSearchPlace].all
      case 'getHotelById':                  return require('./offline-responses/hotel1.json')
      case 'getHotelRooms':                 return require('./offline-responses/rooms1.json')
      case 'getConfigVarByName':            return require('./offline-responses/payment-var.json')
      case 'createReservation':             return require('./offline-responses/booking1.json')
      case 'getUserHasPendingBooking':      return require('./offline-responses/booking1-pending.json')
      case 'getListingsByFilter':           return offlinePacksHomes[autoHomeSearchPlace]
      case 'getMyHotelBookings':            return require('./offline-responses/my-trips-all.json')
      case 'getMyConversations':            return {content: []};
      default: {}
    }
  }
    
	const genPromise = (args, title, delay = 0.1) => new Promise(
		(success, reject) => {
      if (offlineTimeInSeconds[title] != null) {
        delay = offlineTimeInSeconds[title];
      }
      const data = getOfflineResponse(title)
			setTimeout(() => success(promiseRes(data,title)), 1000*delay);
			// rlog(title,`Success::START`,{data,args})
			//console.tron.logImportant(`[${title}] reject`,{args})
		}
  );
  
  const socketDelay = 10; // in milliseconds
	const offlineRequester = {
		// http calls
		login: (...args) 				                => genPromise(args,'login', 0.1),
		getUserInfo: (...args)	                => genPromise(args,'getUserInfo', 2.5),
		getCountries: (...args) 				        => genPromise(args,'getCountries', 0), // with delay 100ms it has an exception
		getCurrencyRates: (...args) 			      => genPromise(args,'getCurrencyRates'),
		getLocRateByCurrency: (...args) 		    => genPromise(args,'getLocRateByCurrency'),
		getRegionsBySearchParameter: (...args) 	=> genPromise(args,'getRegionsBySearchParameter'),
		getStaticHotels: (...args) 				      => genPromise(args,'getStaticHotels',2),
		getMapInfo: (...args) 					        => genPromise(args,'getMapInfo', 1),
		getHotelById: (...args) 					      => genPromise(args,'getHotelById', 0.5),
		getHotelRooms: (...args) 					      => genPromise(args,'getHotelRooms', 0.5),
		getConfigVarByName: (...args) 					=> genPromise(args,'getConfigVarByName'),
		createReservation: (...args) 					  => genPromise(args,'createReservation'),
		getUserHasPendingBooking: (...args) 	  => genPromise(args,'getUserHasPendingBooking'),
    markQuoteIdAsMarked: (...args) 	        => genPromise(args,'getUserHasPendingBooking'),
      // homes
    getListingsByFilter: (...args)          => genPromise(args,'getListingsByFilter', 1),
      // my trips aka bookings
    getMyHotelBookings: (...args)           => genPromise(args,'getMyHotelBookings'),
      // Messages / Inbox
      getMyConversations: (...args)         => genPromise(args,'getMyConversations'),
		// socket
		startSocketConnection: (onData,_this) => {
      let arr = require('./offline-responses/fromSocket.json');
      try {
        const tmp = offlinePacksHotels[autoHotelSearchPlace].socket;
        if (tmp) arr = tmp;
      } catch (e) {
        processError(`[offline::startSocketConnection] Error in getting offline pack: ${e.message}`, {error:e})
      }

			const delayPerRefresh = socketDelay
			const delay2 = 500
			const delay3 = delay2+300
			arr.map((item,index) => {
				const func = () => {
          onData.apply( _this, [ { body: JSON.stringify(item) } ] )
          rlog('SOCKET-OFFLINE',`onData ${index}`,{item,index})
        }
				setTimeout(func, index*delayPerRefresh + delay2);

				if (index+1 == arr.length) {
					onDoneSocket.totalElements = arr.length;
					const func2 = () => onData.apply( _this, [ { body: JSON.stringify(onDoneSocket) } ] )
					setTimeout(func2, index*delayPerRefresh+delay3)
				}
      })
    },
    // etherjs
    getWalletFromEtherJS: callback        => setTimeout(
      () => {
        let data = {locBalance: 0.83};
        callback(data);
        rlog('API-OFFLINE', `getWalletFromEtherJS-1`, {data} )
        setTimeout(() => {
          data =  {ethBalance: 0.00032480};
          callback(data);
          rlog('API-OFFLINE', `getWalletFromEtherJS-2`, {data} )
        }, 1000*offlineTimeInSeconds['getWalletFromEtherJS2']);
      }, 1000*offlineTimeInSeconds['getWalletFromEtherJS1'])
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
