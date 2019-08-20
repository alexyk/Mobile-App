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
import { BackHandler } from "react-native";
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
} from "../../../../config";
import {
  showNumberOnHotelItem,
  HOTELS_SOCKET_CONNECTION_TIMEOUT,
  HOTELS_STATIC_CONNECTION_TIMEOUT,
  HOTELS_SOCKET_CONNECTION_UPDATE_TICK,
  HOTELS_MINIMUM_RESULTS,
  autoGetAllStaticPages,
  hotelSearchIsNative
} from "../../../../config-settings";
import { isOnline, rlog, processError, hotelsSearchSocketDebug, clog, elog } from "../../../../config-debug";
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
  mergeAllHotelData,
  parseSocketHotelData,
  DISPLAY_MODE_NONE,
  DISPLAY_MODE_SEARCHING,
  DISPLAY_MODE_RESULTS_AS_LIST,
  DISPLAY_MODE_RESULTS_AS_MAP,
  DISPLAY_MODE_HOTEL_DETAILS,
  checkHotelData,
  processStaticHotels,
  checkHotelDataPrepare,
  printCheckHotelDataCache
} from "../utils"

import {
  generateSearchString,
  generateWebviewInitialState,
} from "../../utils"

import {
  renderBackButton,
  renderSearchField,
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
import { setIsApplyingFilter } from '../../../../redux/action/userInterface'
import { setSearch, setSearchString } from '../../../../redux/action/hotels'

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
    this.state = createHotelSearchInitialState(params, props.datesAndGuestsData);
    
    this.pageLimit = this.PAGE_LIMIT;
    this.pagesLoaded = 0;
    this.pagesCached = 0;
    this.pageSize = 10;
    this.isAllPagesDone = false;
    this.totalElements = 0;
    this.isMinimumResultLoaded = false;
    this.isAllHotelsLoaded = false;
    this.isFirstLoad = true;
    this.isFirstFilter = true;
    this.isFilterFromUI = false;
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
    this._setSearchString = this._setSearchString.bind(this);
    this.gotoHotelDetailsPageNative = this.gotoHotelDetailsPageNative.bind(this);
    this.getNextStaticPage = this.getNextStaticPage.bind(this);
    this.unsubscribe = this.stopSocketConnection.bind(this);
    this.updateCoords = this.updateCoords.bind(this);
    this.onBackButtonPress = this.onBackButtonPress.bind(this)
    this.onDataFromSocket = this.onDataFromSocket.bind(this);
    this.onStaticData = this.onStaticData.bind(this);
    this.onFilteredData = this.onFilteredData.bind(this);
    this.onFetchNewListViewData = this.onFetchNewListViewData.bind(this);
    this.onToggleMapOrListResultsView = this.onToggleMapOrListResultsView.bind(this);
    this.onServerSearchStarted = this.onServerSearchStarted.bind(this);
    this.onServerSearchError = this.onServerSearchError.bind(this);

    // render functions
    this.renderBackButton = renderBackButton.bind(this)
    this.renderSearchField = renderSearchField.bind(this)
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


  componentDidCatch(error, errorInfo) {
    processError(`[HotelsSearchScreen] Error in component: ${error.message}`, {error,errorInfo});
  }


  componentDidMount() {
    console.log("#hotel-search# 3/6 HotelSearchScreen componentDidMount START");
    checkHotelDataPrepare();

    this.isUnmounted = false;
    this.startStaticDataConnectionTimeOut();
    this.startSocketDataConnectionTimeOut();

    if (this.state.isHotel) {
      this.getStaticHotelsData();
      this._setSearchString();
    }
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

  getNextStaticPage(page=0,elementsCount=10) {
    
    if (this.isAllPagesDone) {
      return;
    }
        
    this.startStaticDataConnectionTimeOut();
    requester
      .getStaticHotels(this.state.regionId, page, elementsCount)
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
        _this.getNextStaticPage(_this.pagesLoaded)
      }
    );
    //console.log("#hotel-search# 4.2/6 [HotelsSearchScreen] getStaticHotelsData");
  }

  onServerSearchStarted(data) {
    clog(`Server Search Started`, data);
  }

  onServerSearchError(...error) {
    elog(`Server Search Error`, error);
  }

  startSearch() {
    UUIDGenerator
      .getRandomUUID()
      .then(value => {
        this._uuid = value;
        const query = `${this._searchString}&uuid=${value}`;

        this.startSocketConnection();

        // initiate search
        requester
          .getSearchHotelResults(query)
          .then(this.onServerSearchStarted)
          .catch(this.onServerSearchError);
      });
  }


  // TODO: Inspect this flow - and create a component to implement it
  startSocketConnection() {
    rlog('socket',`startSocketConnection`);

    this.isSocketDown = false;


    if (isOnline) {
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
    const headers = { "content-length": false };

    //console.log("stompiOSConnect ---------------");
    clog('socket',`stompiOSConnect`,{socketHost,headers,uuid:this._uuid});
    
    stompiOSClient = stomp.client(socketHost);
    stompiOSClient.debug = (hotelsSearchSocketDebug
      ? (msg) => rlog('debug-socket', `${msg.substr(0,30)}` , {msg})
      : null
    );
    stompiOSClient.connect(
      {},
      frame => {
        stompiOSClient.subscribe(`search/${this._uuid}`, this.onDataFromSocket);
      },
      error => {
        stompiOSClient.disconnect();
        this.setState({ isLoading: false });
      }
    );
  }

  stompAndroidConnect() {
    stompAndroidClient = NativeModules.StompModule;

    DeviceEventEmitter.removeAllListeners("onStompConnect");
    DeviceEventEmitter.addListener("onStompConnect", () => {
      console.log("onStompConnect -------------");
    });

    DeviceEventEmitter.removeAllListeners("onStompError");
    DeviceEventEmitter.addListener("onStompError", ({ type, message }) => {
      console.log("onStompError -------------", type, message);
    });

    DeviceEventEmitter.removeAllListeners("onStompMessage");
    DeviceEventEmitter.addListener("onStompMessage", ({ message }) => {
      console.warn('stomp message', message);
      // TODO: (low priority) Solve this difference between iOS and Android
      return this.onDataFromSocket({ body: message });
    });

    const message = `{"uuid":"${this._uuid}","query":"${this._searchString}"}`;
    const destination = "search/" + this._uuid;
    stompAndroidClient.getData(message, destination);
  }

  onDataFromSocket(data) {
    clog('socket-data',`onDataFromSocket`, {data})
    
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
          parsedResult = null;
          processError(`[HotelsSearchScreen] Parse error: ${parseError.message}`,{error:parseError,parsedResult});
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
    } catch (error) {
      processError(`[HotelsSearchScreen] Error while processing in onDataFromSocket: ${error.message}`, {error})
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
    // log('list-refresh-footer',`[old state] ${prevState.hotelsInfo.length} / ${prevState.hotelsInfoForMap.length} [new state] ${result.hotelsInfo.length} / ${result.hotelsInfoForMap.length}`)
    
    console.timeEnd('*** onSocketUpdateTick')

    return {
      isLoading: preloaderIsLoading,
      hotelsInfoForMap: hotelsToRender,
      pricesFromSocketValid
    }
  }

  onDoneSocket = data => {
    console.log( `#hotel-search# [HotelsSearchScreen] onDoneSocket, totalElements: ${data.totalElements}`);
    rlog('on-done-socket',`elements: ${data.totalElements}`, {data,hotelsAll:this.hotelsAll,state:this.state,socketCache:this.hotelsSocketCacheMap})
    
    printCheckHotelDataCache();

    this.stopSocketConnection(false);

    this.setState((prevState) => ({
        pricesFromSocket: data.totalElements,
      }),
      () => {
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


  onBackButtonPress() {
    const { displayMode } = this.state;
    console.log(`[onBackButtonPress] state: ${displayMode}`)

    if (hotelSearchIsNative.step2HotelDetails) {
      this.props.navigation.goBack();
    } else {
      switch (displayMode) {
      
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
    if (hotelSearchIsNative.step2HotelDetails) {
      this.gotoHotelDetailsPageNative(item)
    } else{
      // log('here2', `goto Web-View`,{item})
      if (state && extraParams) {
        // webview inside
        let initialState = generateWebviewInitialState(extraParams, state);

        rlog('item-click',`url: ${initialState.webViewUrl}`)
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

        this.setState({ isLoading: true });
        requester
          .getHotelById(item.id, this._searchString.split("&"))
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
                  searchString: this._searchString,
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
    requester.getHotelById(item.id, this._searchString.split("&")).then(res => {
      // here you set the response in to json
      res.body
        .then(data => {
          const hotelPhotos = [];
          for (let i = 0; i < data.hotelPhotos.length; i++) {
            hotelPhotos.push({ uri: imgHost + data.hotelPhotos[i].url });
          }
          this.setState({ isLoading: false });
          this.props.navigation.navigate("HotelDetails", {
            hotelDetail: item,
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
    if (!this || !(this instanceof HotelsSearchScreen) || this.isUnmounted) {
      console.warn(`[HotelsSearchScreen] Skipping onFilteredData - screen seems unmounted`);
      return;
    }

    if (res.success) {
      res.body.then((data) => {
        // not used so far
        // const isCacheExpired = data.isCacheExpired;
        const count = data.content.length;
        const hotelsAll = data.content;
        checkHotelData(hotelsAll,'filter')
        printCheckHotelDataCache();
        rlog('@@filter-on-server',`${count} filtered hotels, before parsing`, {hotelsAll}, true)

        // parse data
        mergeAllHotelData(hotelsAll, this.hotelsSocketCacheMap, this.hotelsStaticCacheMap)
        checkHotelData(hotelsAll,'filter-parsed')
        printCheckHotelDataCache();
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
              totalHotels: count,
              isLoading: false
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
                if (_this.isFirstFilter) {
                  _this.isFirstFilter = false;
                }
              }
              setTimeout(func, 100);
            } else {
              if (_this.isFirstFilter) {
                _this.isFirstFilter = false;
              }
            }
          }
        )
      });
    } else {
      // //console.log('Search expired');
      this.props.setIsApplyingFilter(false)
      this.setState({error:lang.TEXT.SEARCH_HOTEL_FILTER_ERROR.replace('%1',res.message)})
      if (res.errors) {
        res.errors.then((data) => {
          let {message} = data;
          if (!message) {
            message = `${data}`;
          }
          processError(`[HotelsSearchScreen] Filter error: ${message}`,{res,data});
        })
      } else {
        console.error('[HotelsSearchScreen] Filter error',{res})
      }
    }
  }

  onStaticData(res) {
    const isSkipping = (!this || !this.listViewRef || this.isUnmounted);

    if (isSkipping) {
      console.warn(`[HotelsSearchScreen::onStaticData] Is screen unmounted: ${(this?this.isUnmounted:'n/a')}`,{thisNull: (this==null),listViewRef:(this?this.listViewRef:'n/a'),isUnMounted:(this?this.isUnmounted:'n/a')})      
      return;
    }
    const _this = this;
    
    if (res.success) {
      _this.staticDataReceived = true;
      
      res.body.then(function(data) {
        // a shortcut to all results
        if (autoGetAllStaticPages && _this.isFirstLoad) {
          _this.isFirstLoad = false;
          const newState = {
            totalHotels: data.totalElements,
            totalPages: data.totalPages,
            displayMode: DISPLAY_MODE_RESULTS_AS_LIST
          };
          if (_this.isSocketDown) {
            _this.startSearch();
          }
          _this.setState(newState);
          _this.pageSize = data.totalElements;
          if (_this.pageSize > 1000) {
            _this.pageSize = 1000;
          } 
          _this.getNextStaticPage(0, _this.pageSize);
          return;
        }

        _this.isAllPagesDone = data.last;
        
        if (_this.pagesCached == 0) {
          _this.totalElements = data.totalElements;
        }
        
        let hotels = data.content;
        processStaticHotels(hotels, _this.hotelsStaticCacheMap, _this.hotelsIndicesByIdMap, _this.hotelsAll, _this.isAllHotelsLoaded);
        _this.pagesCached++;
        printCheckHotelDataCache();

        
        if (_this.isAllHotelsLoaded) {
          // this prevents slow static data to overwrite prices data
          //_this.listUpdateDataSource(_this.hotelsAll);
          console.warn(`[HotelsSearchScreen] Skipping static data - page ${_this.pagesCached} (loaded: ${_this.pagesLoaded})`);
          return;
        }
        _this.pagesLoaded++;
        
        const newState = {
          totalHotels: data.totalElements,
          totalPages: data.totalPages,
        };

        // start socket connection if first static load
        if (_this.isFirstLoad) {
          _this.isFirstLoad = false;
          if (_this.isSocketDown) {
            _this.startSearch();
          }
          newState.displayMode = DISPLAY_MODE_RESULTS_AS_LIST;
        }
        _this.setState(newState);

        if ( autoGetAllStaticPages || (!_this.isAllPagesDone && _this.pagesLoaded < _this.INITIAL_PAGES) ) {
          _this.getNextStaticPage(_this.pagesLoaded, _this.pageSize);
        }

      }); // res.body.then
    } else {
      this.listStartFetch([], 0);
      processError(`[HotelsSearchScreen] Could not fetch Static Data for hotels`, {res})
    }
  }

  listAbortFetch() {
    this.listViewHelpers.abortFetch();
  }

  listStartFetch(dataArray, pageLimit) {
    //log('list-startFetch',`data: ${dataArray.length}, pageLimit: ${pageLimit}`,{dataArray,pageLimit,hotelsAll:this.hotelsAll,state:this.state});

    this.listViewHelpers.startFetch(dataArray, pageLimit)
  }

  listUpdateDataSource(data) {
    //log('list-updateData',`listUpdateDataSource, items: ${data ? data.length : 'n/a'}`, {hotels: this.state.hotelsInfo,hotelsForMap: this.state.hotelsInfoForMap,props:this.props,data});

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
    rlog('list-fetch',`res:${this.state.isFilterResult} && loaded:${this.isAllHotelsLoaded}`);
    // Save these methods to use later in list....() methods (for example listStartFetch)
    this.listViewHelpers = { startFetch, abortFetch };
  }

  /**
   * TODO: Check if this can be removed
   * // see old code from before 2019-05-15 when it was cleaned by Alex K
   */
  _setSearchString() {
    this._searchString = generateSearchString(this.state, this.props);
    this.props.setSearchString(this._searchString);
  }

  gotoFilter = () => {
    console.time('*** HotelsSearchScreen::gotoFilter()')

    // log('HotelsSearchScreen','gotoFilter', {props:this.props, state: this.state})
    rlog('HotelsSearchScreen',`gotoFilter  isLoading: ${this.state.isLoading} isFiltering: ${this.props.isApplyingFilter}`, {props:this.props, state: this.state})

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

    this.props.setIsApplyingFilter(true);
    this.isFilterFromUI = fromUI;
    
    if (fromUI) {
      // filter in UI
      filterParams.priceRange = data.priceRange

      const hotelsAll = this.hotelsAll;
      const filtered = applyHotelsSearchFilter(hotelsAll, filterParams);
      const count = filtered.length;
      //this.props.setSearchFiltered(filtered)
      
      rlog('@@filter-fromUI',`Filtered from UI: ${count} / ${hotelsAll.length}`,{filtered,hotelsAll,filterParams},true);
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
      this.isFilterFromUI = false;
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
    this.isWebviewHotelDetail = (isHotelDetails && !hotelSearchIsNative.step2HotelDetails)
    // log('LTLoader/HotelSearch',`isLoading: ${this.state.isLoading} isApplyingFilter: ${this.props.isApplyingFilter} isList: ${isList} isMap: ${isMap}`,{props:this.props, state:this.state})

    return (
      <View style={styles.container}>
        {this.isWebviewHotelDetail && this.renderBackButton()}
        {this.renderSearchField()}
        {this.renderCalendarAndFilters()}

        <View style={styles.containerHotels}>
          {this.renderHotelDetailsAsWebview()}
          {this.renderResultsAsMap()}
          {this.renderResultsAsList()}

          {this.renderMapButton()}
          {this.renderPreloader()}
        </View>

        {this.renderFooter()}
        {this.renderToast() }

        {this.renderDebugWebview()}
        {this.renderDebugMap()}
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    currency: state.currency.currency,
    isApplyingFilter: state.userInterface.isApplyingFilter,
    searchString: state.hotels.searchString,
    searchResults: state.hotels.searchResults,
    datesAndGuestsData: state.userInterface.datesAndGuestsData,
    //searchResultsFiltered: state.hotels.searchResultsFiltered,
  };
};
const mapDispatchToProps = dispatch => ({
  setIsApplyingFilter: bindActionCreators(setIsApplyingFilter, dispatch),
  setSearch: bindActionCreators(setSearch, dispatch),
  setSearchString: bindActionCreators(setSearchString, dispatch),
  //setSearchFiltered: bindActionCreators(setSearchFiltered, dispatch),
})


export default connect(mapStateToProps, mapDispatchToProps)(HotelsSearchScreen);
