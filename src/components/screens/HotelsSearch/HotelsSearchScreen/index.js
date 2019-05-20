/**
 * Hotels search results are loaded like this
 * 
 * ==== Variant 2 - quicker search results (when 30 prices loaded) ====
 * ==== (using footer in simple mode - one simple text field) ====
 * 1) onStaticData
 *    This is the initial load of static hotel data (name,description,image)
 *    5 pages are initially loaded
 
 * 2) onDataFromSocket
 *    Loading prices from socket and updating hotel search
 *    Shown in footer: "N matches" (renderFooter)
 * 
 * 3) onDoneSocket
 *    All prices loaded - start filtering (no update in list)
 * 
 * 4) onFilteredData
 *    Filtering results - removing hotels unavailable. Currently this flow differs from Web-App as
 *    it is using getInfoForMap thus loading all results (not page by page as does the Web-App)
 * 
 */
import React, { Component } from "react";
import { SafeAreaView, BackHandler } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  View,
  Platform,
  NativeModules,
  DeviceEventEmitter,
} from "react-native";


import {
  imgHost,
  socketHost,
  showNumberOnHotelItem,
  HOTELS_SOCKET_CONNECTION_TIMEOUT,
  HOTELS_STATIC_CONNECTION_TIMEOUT,
  HOTELS_SOCKET_CONNECTION_UPDATE_TICK,
  HOTELS_MINIMUM_RESULTS
} from "../../../../config";
import { isOnline, log } from "../../../../config-debug";
import requester from "../../../../initDependencies";

import UUIDGenerator from "react-native-uuid-generator";

import { WebsocketClient } from "../../../../utils/exchangerWebsocket";
import lang from "../../../../language";

import styles from "./styles";

import {
  createHotelSearchInitialState,
  generateFilterInitialData,
  generateHotelFilterString,
  applyHotelsSearchFilter,
  processFilteredHotels,
  hotelsTemporaryFilterAndSort,
  updateHotelsFromFilters,
  updateHotelIdsMap,
  updateHotelsFromSocketCache,
  mergeAllHotelData,
  parseSocketHotelData,
  parseAndCacheHotelDataFromSocket,
  DISPLAY_MODE_NONE,
  DISPLAY_MODE_SEARCHING,
  DISPLAY_MODE_RESULTS_AS_LIST,
  DISPLAY_MODE_RESULTS_AS_MAP,
  DISPLAY_MODE_HOTEL_DETAILS,
  checkHotelData
} from "../utils"

import {
  generateSearchString,
  generateWebviewInitialState,
} from "../../utils"

import {
  renderWebViewBack,
  renderBackButtonAndSearchField,
  renderCalendarAndFilters,
  renderHotelDetailsAsWebview,
  renderResultsAsList,
  renderListItem,
  renderPaginationFetchingView,
  renderPaginationWaitingView,
  renderPaginationAllLoadedView,
  renderResultsAsMap,
  renderMapButton,
  renderFooter,
  renderPreloader,
  renderToast,
  renderDebugWebview,
  renderDebugMap
} from './components'

import stomp from "stomp-websocket-js";
import { isNative } from "../../../../version";
import { setIsApplyingFilter } from '../../../../redux/action/userInterface'
import { setSearch/*, setSearchFiltered*/ } from '../../../../redux/action/hotels'

let stompiOSClient = undefined;
let stompAndroidClient = undefined;

class HotelsSearchScreen extends Component {
  PAGE_LIMIT = 10;
  INITIAL_PAGES = 5;

  constructor(props) {
    super(props);
    console.log("#hotel-search# 2.1/6  HotelSearchScreen constructor START");
    console.disableYellowBox = true;

    const { params } = this.props.navigation.state; //eslint-disable-line
    this.state = createHotelSearchInitialState(params);
    
    this.pageLimit = this.PAGE_LIMIT;
    this.pagesLoaded = 0;
    this.pagesCached = 0;
    this.isAllPagesDone = false;
    this.isMinimumResultLoaded = false;
    this.isAllHotelsLoaded = false;
    this.isFirstLoad = true;
    this.isFirstFilter = true;
    this.isSocketDown = true;
    this.isUnmounted = true;
    this.validSocketPrices = 0;
    this.staticDataReceived = false;
    this.lastSocketUpdateTime = 0;
    this.hotelsAll = [];              // cache for using as filter source
    this.hotelsIndicesByIdMap = null; // see getStaticHotelsData() for populating this one
    this.hotelsStaticCacheMap = {}; // cache for static data (requester.getStaticHotels) 
    this.hotelsSocketCacheMap = {}; // cache for hotels from socket, that are not present on screen (were not fetched by scrolling down the list)
    this.priceMin = 5000;
    this.priceMax = 0;

    this.listViewHelpers = {}; // startFetch & abortFetch (see UltimateListView docs - react-native-ultimate-listview)
    this.webViewRef = null;

    this.socketTimeoutId = -1;
    this.staticTimeoutId = -1;
    
    this.filtersCallback = null;
    this.isWebviewHotelDetail = false

    // Bind functions to this,
    // thus optimizing performance - by using bind(this) instead of "=> function".
    this.gotoHotelDetailsPageNative = this.gotoHotelDetailsPageNative.bind(this);
    this.saveState = this.saveState.bind(this);
    this.getNextStaticPage = this.getNextStaticPage.bind(this);
    this.unsubscribe = this.stopSocketConnection.bind(this);
    this.updateCoords = this.updateCoords.bind(this);
    this.onDataFromSocket = this.onDataFromSocket.bind(this);
    this.onStaticData = this.onStaticData.bind(this);
    this.onFilteredData = this.onFilteredData.bind(this);
    this.onFetchNewListViewData = this.onFetchNewListViewData.bind(this);
    this.onToggleMapOrListResultsView = this.onToggleMapOrListResultsView.bind(this);

    // render functions
    this.renderWebViewBack = renderWebViewBack.bind(this)
    this.renderBackButtonAndSearchField = renderBackButtonAndSearchField.bind(this)
    this.renderCalendarAndFilters = renderCalendarAndFilters.bind(this)
    this.renderHotelDetailsAsWebview = renderHotelDetailsAsWebview.bind(this)
    this.renderResultsAsList = renderResultsAsList.bind(this)
    this.renderListItem = renderListItem.bind(this);
    this.renderPaginationFetchingView = renderPaginationFetchingView.bind(this)
    this.renderPaginationWaitingView = renderPaginationWaitingView.bind(this)
    this.renderPaginationAllLoadedView = renderPaginationAllLoadedView.bind(this)
    this.renderResultsAsMap = renderResultsAsMap.bind(this)
    this.renderMapButton = renderMapButton.bind(this)
    this.renderFooter = renderFooter.bind(this)
    this.renderPreloader = renderPreloader.bind(this)
    this.renderToast = renderToast.bind(this)
    this.renderDebugWebview = renderDebugWebview.bind(this)
    this.renderDebugMap = renderDebugMap.bind(this)


    //TODO: @@debug - remove
    console.log("#hotel-search# 2.2/6 HotelSearchScreen constructor END");
    this.renderTimes = 0;
    this.renderItemTimes = 0;
  }

  componentDidMount() {
    console.log("#hotel-search# 3/6 HotelSearchScreen componentDidMount START");

    this.isUnmounted = false;
    this.startStaticDataConnectionTimeOut();
    this.startSocketDataConnectionTimeOut();

    if (this.state.isHotel) {
      this.getStaticHotelsData();
    }

    // TODO: Figure out why is this call used
    // It was initially called from the constructor body (why? how is it possible to work)
    this.saveState();
  }
  
  componentWillMount() {
    if (Platform.OS == 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPress);
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
    this.isSocketDown = true;

    clearTimeout(this.socketTimeoutId);
    clearTimeout(this.staticTimeoutId);

    this.stopSocketConnection();

    if (Platform.OS == 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPress);
    }
  }

  startSocketDataConnectionTimeOut() {
    //log({name:'SOCKET',preview:`Starting Socket connection timeout, ${isOnline?'online':'offline'}`,important:true})
    if (!isOnline) return;

    const _this = this;
    const funcSocketTimeout = function() {
      if (_this.validSocketPrices == 0  && _this && !_this.isUnmounted) {
        _this.setState({ isSocketTimeout: true });
      }
      //log('SOCKET',`Socket connection timeout DONE, valid socket prices: ${_this.validSocketPrices}`,null,true)
    };
    if (this && !this.isUnmounted) {
      this.setState({ isSocketTimeout: false });
    }

    if (this.socketTimeoutId > -1) {
      clearTimeout(this.socketTimeoutId);
      this.socketTimeoutId = -1;
    }
    this.socketTimeoutId = setTimeout(
      funcSocketTimeout,
      1000 * HOTELS_SOCKET_CONNECTION_TIMEOUT
    );
  }

  startStaticDataConnectionTimeOut() {
    const _this = this;
    const funcStaticHotelsTimeout = function() {
      if (!_this.staticDataReceived && _this && !_this.isUnmounted) {
        _this.setState({ isStaticTimeout: true });
      }
    };

    this.staticDataReceived = false;
    if (this && !this.isUnmounted) {
      this.setState({ isStaticTimeout: false });
    }

    if (this.staticTimeoutId > -1) {
      clearTimeout(this.staticTimeoutId);
      this.staticTimeoutId = -1;
    }
    this.staticTimeoutId = setTimeout(
      funcStaticHotelsTimeout,
      1000 * HOTELS_STATIC_CONNECTION_TIMEOUT
    );
  }

  getNextStaticPage(page=0) {
    // log('static-page',`${this.isAllPagesDone ? 'SKIPPING loading' : 'Loading'} page ${page}, all pages: ${this.isAllPagesDone}`);

    if (this.isAllPagesDone) {
      return
    }

    this.startStaticDataConnectionTimeOut();
    requester
      .getStaticHotels(this.state.regionId,page)
      .then(this.onStaticData);
  }

  getStaticHotelsData() {
    console.log("#hotel-search# 4.1/6 [HotelsSearchScreen] getStaticHotelsData");

    this.hotelsIndicesByIdMap = {};
    const _this = this;

    this.setState(
      // change state function
      function(prevState, updatedProps) {
        //console.log('SET_STATE 1', {prevState,updatedProps})
        return {
          displayMode: (prevState.displayMode == DISPLAY_MODE_NONE ? DISPLAY_MODE_SEARCHING : prevState.displayMode),
          hotelsInfo: [],
          allElements: false,
          editable: false
        };
      },

      // callback (after change state above)
      function() {
        _this.getNextStaticPage()
      }
    );
    //console.log("#hotel-search# 4.2/6 [HotelsSearchScreen] getStaticHotelsData");
  }

  // TODO: Inspect this flow - and create a component to implement it
  async startSocketConnection() {
    this.isSocketDown = false;

    if (isOnline) {
      this.uuid = await UUIDGenerator.getRandomUUID();

      // common code
      WebsocketClient.startGrouping();

      if (Platform.OS === "ios") {
        this.stompiOSConnect();
      } else if (Platform.OS === "android") {
        this.stompAndroidConnect();
      }
    } else {
    	requester.startSocketConnection(this.onDataFromSocket, this)
    }
  }

  // TODO: Inspect this flow - and create a component to implement it
  stopSocketConnection(removeListeners = true) {
  	if (!isOnline) return;
  	
    // common code
    if (removeListeners) {
      WebsocketClient.stopGrouping();
      this.isSocketDown = true;
    }

    // platform specific
    if (Platform.OS === "ios") {
      // TODO: Figure out why this is null sometimes
      if (stompiOSClient) {
        stompiOSClient.disconnect();
      }
    } else if (Platform.OS === "android") {
      if (removeListeners) {
        DeviceEventEmitter.removeAllListeners("onStompConnect");
        DeviceEventEmitter.removeAllListeners("onStompError");
        DeviceEventEmitter.removeAllListeners("onStompMessage");
      }

      if (stompAndroidClient) {
        stompAndroidClient.close();
      }
    }

    // stompAndroidClient = null;
    // stompiOSClient = null;
  }

  stompiOSConnect() {
    //console.log("stompiOSConnect ---------------");

    stompiOSClient = stomp.client(socketHost);
    stompiOSClient.debug = null;
    stompiOSClient.connect(
      {},
      frame => {
        var headers = { "content-length": false };
        stompiOSClient.subscribe(`search/${this.uuid}`, this.onDataFromSocket);
        stompiOSClient.send(
          "search",
          headers,
          JSON.stringify({ uuid: this.uuid, query: this.searchString })
        );
      },
      error => {
        stompiOSClient.disconnect();
        this.setState({ isLoading: false });
      }
    );
  }

  stompAndroidConnect() {
    stompAndroidClient = NativeModules.StompModule;

    //console.log("stompAndroid -------------");
    //console.log("stompAndroid---------------", this.uuid, this.searchString);
    const message =
      '{"uuid":"' + this.uuid + '","query":"' + this.searchString + '"}';
    const destination = "search/" + this.uuid;

    DeviceEventEmitter.removeAllListeners("onStompConnect");
    DeviceEventEmitter.addListener("onStompConnect", () => {
      //console.log("onStompConnect -------------");
    });

    DeviceEventEmitter.removeAllListeners("onStompError");
    DeviceEventEmitter.addListener("onStompError", ({ type, message }) => {
      //console.log("onStompError -------------", type, message);
    });

    DeviceEventEmitter.removeAllListeners("onStompMessage");
    DeviceEventEmitter.addListener("onStompMessage", ({ message }) => {
      // console.warn('stomp message', message);
      // TODO: (low priority) Solve this difference between iOS and Android
      return this.onDataFromSocket({ body: message });
    });

    stompAndroidClient.getData(message, destination);
  }

  onDataFromSocket(data) {
    //log('socket-data',`onDataFromSocket ${data.body}`, {data})
    if (!this || !this.listViewRef || this.isUnmounted) {
      console.warn(`[HotelsSearchScreen::onDataFromSocket] Is screen unmounted: ${(this?this.isUnmounted:'n/a')}`,{thisNull: (this==null),listViewRef:(this?this.listViewRef:'n/a'),isUnMounted:(this?this.isUnmounted:'n/a')})      
      return;
    }

    console.time('*** onDataFromSocket')


    const { body } = data;
    
    try {
      const parsedData = JSON.parse(body);

      // restart timeout (thus also clean red styling of footer)
      if (this.state.isSocketTimeout) {
        this.startSocketDataConnectionTimeOut();
      }

      if (parsedData.hasOwnProperty("allElements")) {
        // TODO: @@debug - remove
        // console.warn(`#hotel-search# [HotelsSearchScreen] onDataFromSocket, DONE`, parsedData);

        if (parsedData.allElements) {
          this.setState({
            allElements: true,
            editable: true,
            pricesFromSocketValid: this.validSocketPrices
          });
          this.onDoneSocket(parsedData);
        }
      } else {
        const hotelData = parsedData;
        const {id} = hotelData;
        const staticHotelData = this.hotelsStaticCacheMap[id];
        
        checkHotelData(hotelData,'socket-orig')

        // Safe parse hotelData
        let initialCoord;
        let parsedResult;
        try {
          parsedResult = parseSocketHotelData(hotelData,staticHotelData);
        } catch (parseError) {
          console.warn(`[HotelsSearchScreen] Parse error: ${parseError.message}`, {parseError,parsedResult})
          parsedResult = null;
        }
        const {hotelData: parsedHotelData, initialCoord: coord} = (parsedResult ? parsedResult : {});
        let {price} = parsedHotelData;
        if (parsedResult) {
          if (coord) {
            initialCoord = coord;
          }
          this.hotelsSocketCacheMap[id] = parsedHotelData;
          checkHotelData(parsedHotelData,'socket-parsed');
        }
        //log('socket-data',`onDataFromSocket ${id}, price-parced:${price} price-raw:${hotelData.price}`, {hotelData,parsedHotelData})

        if (!isNaN(price)) {
          // update socket prices loaded in footer
          this.validSocketPrices++;
          this.hotelsAll.push(parsedHotelData)

          let newState = {};
          if (this.state.initialLat == null && this.state.initialLon == null && initialCoord) {
            newState = {...initialCoord};
          }
    
          // At intervals of HOTELS_SOCKET_CONNECTION_UPDATE_TICK seconds
          // refresh prices in footer and list prices loaded so far:
          const currentTime = new Date().getTime();
          const limitTime = this.lastSocketUpdateTime + HOTELS_SOCKET_CONNECTION_UPDATE_TICK * 1000;
          if (!this.lastSocketUpdateTime || limitTime < currentTime) {
            this.lastSocketUpdateTime = currentTime;

            // optimise execution with delaying some parts
            const delayedFunc = () => {
              newState = {...newState, ...this.onSocketUpdateTick()};
              // log('state-update',`onDataFromSocket`,{newState,oldState:this.state,initialCoord})//, ${Object.keys(newState).map(key => `${key}:${newState[key]}`)}`, {newState, all:this.hotelsAll, socket:this.hotelsSocketCacheMap, static:this.hotelsStaticCacheMap})
              this.setState(newState);
            }
            setTimeout(delayedFunc, 100)
          }
        } else {
          // skip processing hotel data from socket without price
          //console.log('skipping hotel data from socket without price', hotelData)
        }
      }
    } catch (e) {
      throw e
      console.error(`ERROR in HotelsSearchScreen::onDataFromSocket: ${e.message}`, {e});
    }

    console.timeEnd('*** onDataFromSocket')
  }


  /**
   * Executes on every HOTELS_SOCKET_CONNECTION_UPDATE_TICK seconds
   * @returns (Object) The result contains any state updates that should happen
   */
  onSocketUpdateTick() {
    console.time('*** onSocketUpdateTick')

    const pricesFromSocketValid = this.validSocketPrices;
    const hotelsToRender  = hotelsTemporaryFilterAndSort(this.hotelsAll)
    let preloaderIsLoading = true;
    if (hotelsToRender.length >= HOTELS_MINIMUM_RESULTS) {
      this.isMinimumResultLoaded = true;
      preloaderIsLoading = false;
    }

    this.listStartFetch(hotelsToRender, this.pageLimit);
    //log('list-refresh-footer',`[old state] ${prevState.hotelsInfo.length} / ${prevState.hotelsInfoForMap.length} [new state] ${result.hotelsInfo.length} / ${result.hotelsInfoForMap.length}`)
    
    console.timeEnd('*** onSocketUpdateTick')

    return {
      isLoading: preloaderIsLoading,
      hotelsInfoForMap: hotelsToRender,
      pricesFromSocketValid
    }
  }

  onDoneSocket = data => {
    console.log( `#hotel-search# [HotelsSearchScreen] onDoneSocket, totalElements: ${data.totalElements}`);
    log('list-donesocket',`elements: ${data.totalElements}`, {data,hotelsAll:this.hotelsAll,state:this.state,socketCache:this.hotelsSocketCacheMap})
    
    //TODO: @@@debug remove
//     let asArray = []
//     for (let i in this.hotelsSocketCacheMap) {
//     	if (! isNaN(i)) {
//     		asArray.push(this.hotelsSocketCacheMap[i])
//     	}
//     }
    //log('socket-hotels',`${this.validSocketPrices} prices of ${this.state.totalHotels} hotels, onDoneSocket cache`,{orig:this.hotelsSocketCacheMap.orig,parsed:this.hotelsSocketCacheMap},true)
    //  log('socket-hotels',`${this.validSocketPrices} prices of ${this.state.totalHotels} hotels, onDoneSocket cache`,{asArray},true)

    this.stopSocketConnection(false);

    // if (this.pageLimit > data.totalElements) {
      // this.listSetPageLimit(data.totalElements);
    // }
    this.setState((prevState) => ({
        pricesFromSocket: data.totalElements,
      }),
      () => {
        // this.listSetPageLimit(this.state.totalHotels)
        //log({name:'SOCKET',preview:`onDoneSocket`,important:true,value:{data,state:this.state,props:this.props}})
        this.isAllHotelsLoaded = false;
        this.props.setIsApplyingFilter(true);
        this.setState({ isDoneSocket: true, isLoading: false });

        // get first filtered results from server - showing unavailable as well
        this.updateFilter(generateFilterInitialData(true, this.state),false)
        // then with UI filtering remove unavailable
        this.filtersCallback =  () => {
          if (this && this.listViewRef) {
            this.updateFilter(generateFilterInitialData(false, this.state), true)
            const priceRange = [this.priceMin,this.priceMax];
            this.setState({priceRange,priceRangeSelected: priceRange})
          } else {
            console.warn('[HotelsSearchScreen::filtersCallback] this.listViewRef seems null - is screen unmounted?',{thisNull: (this==null),listViewRef:(this?this.listViewRef:'n/a'),isUnMounted:(this?this.isUnmounted:'n/a')})
          }
        }
      }
    );
  };

  onBackButtonPress = () => {
    switch (this.state.displayMode) {
    
      case DISPLAY_MODE_HOTEL_DETAILS:
        this.setState({
          displayMode: DISPLAY_MODE_RESULTS_AS_LIST,
          isLoading: false,
          selectedHotelData: null
        });
        break;

      default:
        this.props.navigation.goBack();
        break;

    }

    if (Platform.OS == 'android') {
      return true;
    }
  };

  onToggleMapOrListResultsView() {
    const displayMode =
      this.state.displayMode == DISPLAY_MODE_RESULTS_AS_LIST
        ? DISPLAY_MODE_RESULTS_AS_MAP
        : DISPLAY_MODE_RESULTS_AS_LIST;

    // this.isFirstLoad = true;
    //console.log(`[HotelsSearchScreen] displayMode: ${this.state.displayMode}`)

    // Change display mode with delay 
    // to prevent button from staying semi-transparent
    const func = () => {if (this) this.setState({ displayMode })};
    setTimeout(func, 100);
  }

  gotoHotelDetailsFromItemClick = (item, state, extraParams) => {
    console.tron.logImportant('isNative',`isNative: ${isNative.hotelItem};`,{isNative})

    if (isNative.hotelItem) {
      // log('here', `gotoHotelDetailsPageNative`,{item})
      this.gotoHotelDetailsPageNative(item)
    } else{
      // log('here2', `goto Web-View`,{item})
      if (state && extraParams) {
        // webview inside
        let initialState = generateWebviewInitialState(extraParams, state);

        log('item-click',`url: ${initialState.webViewUrl}`)
        /*console.log(`[HotelsSearchScreen] Loading hotel info`, {
          initialState,
          extraParams,
          item,
          state
        });*/

        this.setState({
          isLoading: true,
          webViewUrl: initialState.webViewUrl,
          selectedHotelData: item,
          displayMode: DISPLAY_MODE_HOTEL_DETAILS,
        });
      } else {
        //console.log("gotoHotelDetailsPage", item, this.searchString.substring(1), this.searchString.substring(1).split('&'));

        this.setState({ isLoading: true });
        requester
          .getHotelById(item.id, this.searchString.split("&"))
          .then(res => {
            //console.log("requester.getHotelById", res);
            // here you set the response in to json
            res.body
              .then(data => {
                console.log("requester.getHotelById data", data);
                const hotelPhotos = [];
                for (let i = 0; i < data.hotelPhotos.length; i++) {
                  hotelPhotos.push({ uri: imgHost + data.hotelPhotos[i].url });
                }
                this.setState({ isLoading: false });
                this.props.navigation.navigate("HotelDetails", {
                  guests: this.state.guests,
                  hotelDetail: item,
                  searchString: this.searchString,
                  hotelFullDetails: data,
                  dataSourcePreview: hotelPhotos,
                  daysDifference: this.state.daysDifference
                });
              })
              .catch(err => {
                //console.log(err);
              });
          });
      }
    }
  };

  
  gotoHotelDetailsPageNative(item) {
    //console.log("gotoHotelDetailsPageNative", item);

    this.setState({ isLoading: true });
    requester.getHotelById(item.id, this.searchString.split("&")).then(res => {
      // here you set the response in to json
      res.body
        .then(data => {
          const hotelPhotos = [];
          for (let i = 0; i < data.hotelPhotos.length; i++) {
            hotelPhotos.push({ uri: imgHost + data.hotelPhotos[i].url });
          }
          this.setState({ isLoading: false });
          this.props.navigation.navigate("HotelDetails", {
            guests: this.state.guests,
            hotelDetail: item,
            searchString: this.searchString,
            hotelFullDetails: data,
            dataSourcePreview: hotelPhotos,
            daysDifference: this.state.daysDifference
          });
        })
        .catch(err => {
          //console.log(err);
        });
    });
  }


  onFilteredData(res) {
    const _this = this;

    if (res.success) {
      if (this.refs.toast && this.state.displayMode != DISPLAY_MODE_HOTEL_DETAILS) {
        this.refs.toast.show(lang.TEXT.SEARCH_HOTEL_FILTERED_MSG, 3000);
      }

      res.body.then((data) => {
        // not used so far
        // const isCacheExpired = data.isCacheExpired;
        const count = data.content.length;
        const hotelsAll = data.content;
        checkHotelData(hotelsAll,'filter')

        log('@@filter-on-server',`${count} filtered hotels, before parsing`, {hotelsAll}, true)

        // parse data
        mergeAllHotelData(hotelsAll, this.hotelsSocketCacheMap, this.hotelsStaticCacheMap)
        checkHotelData(hotelsAll,'filter-parsed')

        // log('filtered-hotels',`${count} filtered hotels, after parsing`, {hotelsAll})

        const oldHotels = this.hotelsAll;
        if (this.isFirstFilter) {
          // caching to:
            // an immediately available var
          this.hotelsAll = hotelsAll;
            // Redux
          this.props.setSearch(hotelsAll);
        }

        // pagination of list component (renderResultsAsList)
        this.listSetPageLimit(count, this.PAGE_LIMIT);
        
        // log('filtered-hotels',`before processing`, {hotelsAll,ids:this.hotelsIndicesByIdMap,min:this.priceMin,max:this.priceMax})
        const {priceMin,priceMax,newIdsMap} = processFilteredHotels(hotelsAll, oldHotels, this.hotelsIndicesByIdMap, this.priceMin, this.priceMax)
        this.priceMin = priceMin;
        this.priceMax = priceMax;
        this.hotelsIndicesByIdMap = newIdsMap;        
        // log('filtered-hotels',`after processing`, {hotelsAll,ids:this.hotelsIndicesByIdMap,min:this.priceMin,max:this.priceMax,fromSocket:this.hotelsSocketCacheMap})

        // update state with new hotels
        this.setState(
          // state update
          (prevState) => {
            this.listUpdateDataSource(hotelsAll);
            const newState = {
              hotelsInfo: hotelsAll,
              hotelsInfoForMap: hotelsAll,
              totalHotels: count
            }
            return newState;
          },
          // callback after state update
          () => {
            if (_this.filtersCallback) {
              const func = () => {
                _this.filtersCallback()
                _this.filtersCallback = null;
                _this.props.setIsApplyingFilter(false);
              }
              setTimeout(func, 100)
            }
            if (_this.isFirstFilter) {
              _this.isFirstFilter = false;
            }
          }
        )
      });
    } else {
      // //console.log('Search expired');
      this.props.setIsApplyingFilter(false)
      this.setState({error:lang.TEXT.SEARCH_HOTEL_FILTER_ERROR.replace('%1',res.message)})
      console.error('[HotelsSearchScreen] Filter error',{res})
    }
  }

  onStaticData(res) {  
    if (!this || !this.listViewRef || this.isUnmounted) {
      console.warn(`[HotelsSearchScreen::onStaticData] Is screen unmounted: ${(this?this.isUnmounted:'n/a')}`,{thisNull: (this==null),listViewRef:(this?this.listViewRef:'n/a'),isUnMounted:(this?this.isUnmounted:'n/a')})      
      return;
    }

    const _this = this;
    //console.log(` RESULT: ${res.success} `, {res})
    
    if (res.success) {
      _this.staticDataReceived = true;
      
      res.body.then(function(data) {
        
        if (data.last) {
          _this.isAllPagesDone = true;
        }
        let hotels = data.content;
        hotels.map( (item) => {
          _this.hotelsStaticCacheMap[item.id] = item;
          if (_this.isAllHotelsLoaded) {
            const index = _this.hotelsIndicesByIdMap[item.id];
            const itemInList = _this.hotelsAll[index];
            if (itemInList) {
              itemInList.hotelPhoto = item.hotelPhoto;
            }
          }
        });
        _this.pagesCached++;

        if (_this.isAllHotelsLoaded) {
          // this prevents slow static data to overwrite prices data
          //_this.listUpdateDataSource(_this.hotelsAll);
          console.warn(`[HotelsSearchScreen] Skipping static data - page ${_this.pagesCached} (loaded: ${_this.pagesLoaded})`);
          return;
        }
        _this.pagesLoaded++;
        
        //log('static-hotels',`+${hotels.length} of ${_this.state.totalHotels} static hotels`, {hotels}, true)
        checkHotelData(hotels,'static')

        const newState = {
          totalHotels: data.totalElements,
          totalPages: data.totalPages,
        };

        // start socket connection if first static load
        if (_this.isFirstLoad) {
          _this.isFirstLoad = false;
          if (_this.isSocketDown) {
            _this.startSocketConnection();
          }
          newState.displayMode = DISPLAY_MODE_RESULTS_AS_LIST;
        } else {
          if (!_this.isAllPagesDone && _this.pagesLoaded < _this.INITIAL_PAGES) {
            _this.getNextStaticPage(_this.pagesLoaded);
          }
        }

        _this.setState(newState);
      }); // res.body.then
    } else {
      console.error(
        "[HotelsSearchScreen] Could not fetch Static Data for hotels"
      );
      log('error',`Could not get hotels static data`,{res})
      this.listStartFetch([], 0);
    }
  }

  listAbortFetch() {
    this.listViewHelpers.abortFetch();
  }

  listStartFetch(dataArray, pageLimit) {
    log('list-startFetch',`data: ${dataArray.length}, pageLimit: ${pageLimit}`,{dataArray,pageLimit,hotelsAll:this.hotelsAll,state:this.state});

    this.listViewHelpers.startFetch(dataArray, pageLimit)
  }

  listUpdateDataSource(data) {
    log('list-updateData',`listUpdateDataSource, items: ${data ? data.length : 'n/a'}`, {
      hotels: this.state.hotelsInfo,
      hotelsForMap: this.state.hotelsInfoForMap,
      props:this.props,
      data
    });
  	console.time('*** HotelsSearchScreen::listUpdateDataSource()')
    this.listViewRef.updateDataSource(data)
  	console.timeEnd('*** HotelsSearchScreen::listUpdateDataSource()')
  }

  listSetPageLimit(value, fallbackValue=this.PAGE_LIMIT) {
    //log('hotel-search',`[ listSetPageLimit ] value: ${value}`);
    if (value < fallbackValue) {
      this.pageLimit = value;
    } else {
      this.pageLimit = fallbackValue;
    }
  }

  // onFetch (page = 1, startFetch, abortFetch) {
  onFetchNewListViewData(page = 1, startFetch, abortFetch) {
    //log('fetch',`res:${this.state.isFilterResult} && loaded:${this.isAllHotelsLoaded}`)

    if (this.isAllHotelsLoaded) {
      // no getting static hotels data after everything is loaded (sockets done + initial filter applied)
      return;
    }

    // Save these methods to use later in list....() methods (for example listStartFetch)
    this.listViewHelpers = { startFetch, abortFetch };

    /* if (this.isFirstLoad) {
      // do nothing if first fetch
    } else  */{
      try {
        //console.log("### onFetch 0");
        this.startStaticDataConnectionTimeOut();

        if (this.state.isFilterResult) {
          //console.log("### onFetch 2.1");
          const strSearch = generateSearchString(this.state, this.props);
          const strFilters = generateHotelFilterString(this.listViewRef.getPage(), this.state);
          requester
            .getLastSearchHotelResultsByFilter(strSearch, strFilters)
            .then(this.onStaticData);
        } else {
          //console.log("### onFetch 1.1");
          requester
            .getStaticHotels(this.state.regionId, page - 1)
            .then(this.onStaticData);
        }
      } catch (err) {
        //console.log("### onFetch Error", err);
        //console.log("onFetch--=- error  ", err);
        this.listAbortFetch(); // manually stop the refresh or pagination if it encounters network error
        console.log('Error in HotelsSearchScreen::onFetchNewListViewData', err)
      }
    }
  }

  /**
   * TODO: Check if this can be removed
   * // see old code from before 2019-05-15 when it was cleaned by Alex K
   */
  saveState() {
    if (this.state.isHotel) {
      this.searchString = generateSearchString(this.state, this.props);
    }
  }

  gotoFilter = () => {
    console.time('*** HotelsSearchScreen::gotoFilter()')

    // log('HotelsSearchScreen','gotoFilter', {props:this.props, state: this.state})

    if (this.state.isLoading || this.props.isApplyingFilter) {
      //log('[HotelsSearch] gotoFilter::toast', {state:this.state, props:this.props})
      this.refs.toast.show(lang.TEXT.SEARCH_HOTEL_FILTER_NA, 3000);
    } else 
    {
      if (this.state.allElements) {
        if (this.state.isHotel) {
          this.props.navigation.navigate("HotelFilterScreen", {
            isHotelSelected: true,
            updateFilter: this.updateFilter,
            selectedRating: this.state.selectedRating,
            showUnAvailable: this.state.showUnAvailable,
            nameFilter: this.state.nameFilter,
            orderBy: this.state.orderBy,
            priceRange: this.state.priceRange,
            priceRangeSelected: this.state.priceRangeSelected
          });
        }
      }
    }
    console.timeEnd('*** HotelsSearchScreen::gotoFilter()')
  };

  updateCoords(coords) {
    this.setState({
      initialLat: coords.initialLat,
      initialLon: coords.initialLon
    })
  }

  updateFilter = (data, fromUI=false) => {
    console.time('*** HotelsSearchScreen::updateFilter()')
    const filterParams = {
      isFilterResult: true,
      showUnAvailable: data.showUnAvailable,
      nameFilter: data.nameFilter,
      selectedRating: data.selectedRating,
      orderBy: data.orderBy,
    }

    this.setState({
      error: null,
      ...filterParams
    })


    if (fromUI) {
      // filter in UI
      this.props.setIsApplyingFilter(true);
      filterParams.priceRange = data.priceRange

      const hotelsAll = this.hotelsAll;
      const filtered = applyHotelsSearchFilter(hotelsAll, filterParams);
      const count = filtered.length;
      //this.props.setSearchFiltered(filtered)
      
      log('@@filter-fromUI',`Filtered from UI: ${count} / ${hotelsAll.length}`,{filtered,hotelsAll,filterParams},true);
      checkHotelData(filtered,'filter-fromUI')

      // add no
      this.hotelsIndicesByIdMap = {};
      if (showNumberOnHotelItem) {
        filtered.forEach((item,index) => {
          item.no = index + 1;
          this.hotelsIndicesByIdMap[item.id] = index;
          return item;
        })
      }
      
      this.listSetPageLimit(this.state.totalHotels, this.PAGE_LIMIT);
      this.listUpdateDataSource(filtered)
      this.setState({
        hotelsInfo: filtered,
        hotelsInfoForMap: filtered,
        priceRangeSelected: data.priceRange,
        totalHotels: count
      })

      this.props.setIsApplyingFilter(false)
      if (!this.isAllHotelsLoaded) {
        this.isAllHotelsLoaded = true;
      }
    } else {
      // filter on server
      filterParams.priceRange = (data.priceRange[0] > data.priceRange[1]
          ? [0,50000]
          : [data.priceRange[0], data.priceRange[1]]
      )

      this.setState(
        // change state (object in this case)
        filterParams,
        // callback (after change state above)
        function() {
          const search = generateSearchString(this.state, this.props);
          const filters = generateHotelFilterString(-1, this.state);
          ////console.log("search --- filters", search, filters);
          this.fetchFilteredResults(search, filters);
        }
      );
    }
    console.timeEnd('*** HotelsSearchScreen::updateFilter()')
  };

  fetchFilteredResults = (strSearch, strFilters) => {
    // get all results instead of only first page
    
    // requester methods:
    
    // (1) getLastSearchHotelResultsByFilter(strSearch, strFilters)
    //    - this one returns a filtered last search page only
    // Example:
    //    requester
    //      .getLastSearchHotelResultsByFilter(strSearch, strFilters)
    //      .then(this.onFilteredData);

    // (2) getMapInfo(strSearch+strFilters)
    //    - this one returns all search results filtered
    // Example:
    //    requester
    //      .getMapInfo( strSearch + strFilters )
    //      .then(this.onFilteredData);


    requester
      // .getLastSearchHotelResultsByFilter(strSearch, strFilters)
      .getMapInfo( strSearch + strFilters )
      .then(this.onFilteredData);
  };

  onWebViewLoadStart() {
    console.log("[HotelsSearchScreen] Webview load started");
  }

  onWebViewLoadEnd() {
    console.log("[HotelsSearchScreen] Webview loaded");
    const func = () => this.setState({ isLoading: false });
    setTimeout(func, 3000)
  }

  onWebViewNavigationState(navState) {
    // console.log("[HotelsSearchScreen] Webview nav state");
    console.log('WEB-VIEW',`onWebViewNavigationState(): ${this.state.webViewUrl}`, {url:this.state.webViewUrl})
    // log('WEB-VIEW',`onWebViewNavigationState(): ${this.state.webViewUrl}`, {url:this.state.webViewUrl})
  }

  render() {
    // TODO: @@debug - remove this
    // this.renderTimes++;
    //if (this.renderTimes <= 20)
    // console.log(`#hotel-search# 6/6 HotelSearchScreen render #${this.renderTimes}`);

    // console.log(`### [HotelsSearchScreen] {all:this.state.allElements});

    const isHotelDetails = this.state.displayMode == DISPLAY_MODE_HOTEL_DETAILS;
    this.isWebviewHotelDetail = (isHotelDetails && !isNative.hotelItem)
    // log('LTLoader/HotelSearch',`isLoading: ${this.state.isLoading} isApplyingFilter: ${this.props.isApplyingFilter} isList: ${isList} isMap: ${isMap}`,{props:this.props, state:this.state})

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {this.renderWebViewBack()}
          {this.renderBackButtonAndSearchField()}
          {this.renderCalendarAndFilters()}

          <View style={styles.containerHotels}>
            {this.renderHotelDetailsAsWebview()}
            {this.renderResultsAsMap()}
            {this.renderResultsAsList()}
  
            {this.renderPreloader()}
            {this.renderMapButton()}
          </View>

          {this.renderFooter()}
          {this.renderToast() }

          {this.renderDebugWebview()}
          {this.renderDebugMap()}
        </View>

        {/* <ProgressDialog
                      visible={this.state.isLoading}
                      title="Please Wait"
                      message="Loading..."
                      animationType="slide"
                      activityIndicatorSize="large"
                      activityIndicatorColor="black"/> */}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    currency: state.currency.currency,
    isApplyingFilter: state.userInterface.isApplyingFilter,
    searchResults: state.hotels.searchResults,
    //searchResultsFiltered: state.hotels.searchResultsFiltered,
  };
};
const mapDispatchToProps = dispatch => ({
  setIsApplyingFilter: bindActionCreators(setIsApplyingFilter, dispatch),
  setSearch: bindActionCreators(setSearch, dispatch),
  //setSearchFiltered: bindActionCreators(setSearchFiltered, dispatch),
})


export default connect(mapStateToProps, mapDispatchToProps)(HotelsSearchScreen);
