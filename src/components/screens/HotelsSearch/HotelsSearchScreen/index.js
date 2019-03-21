import React, { Component } from 'react';
import { SafeAreaView } from 'react-native';
import { connect } from 'react-redux';
import { TouchableOpacity, View, Platform, NativeModules, DeviceEventEmitter, Dimensions, Text } from 'react-native';

import FontAwesome, { Icons } from 'react-native-fontawesome';

import { imgHost, socketHost } from '../../../../config';
import SearchBar from '../../../molecules/SearchBar';
import DateAndGuestPicker from '../../../organisms/DateAndGuestPicker';
import HotelItemView from '../../../organisms/HotelItemView';
import requester from '../../../../initDependencies';

import UUIDGenerator from 'react-native-uuid-generator';
import ProgressDialog from '../../../atoms/SimpleDialogs/ProgressDialog';
import _ from 'lodash';
import moment from 'moment';

import {UltimateListView} from 'react-native-ultimate-listview'
import Image from 'react-native-remote-svg';
import { DotIndicator } from 'react-native-indicators';
import MapModeHotelsSearch from '../MapModeHotelsSearch'
import { WebsocketClient } from '../../../../utils/exchangerWebsocket';
import lang from "../../../../language"

import styles from './styles';
import { 
    createInitialState, updateHotelIdsMap, generateSearchString, updateHotelFromSocket,
    updateHotelsFromSocketCache, debugHotelData
} from '../../utils';
import stomp from 'stomp-websocket-js';

const { width, height } = Dimensions.get('window')

let stompiOSClient = undefined;
let stompAndroidClient = undefined;

class HotelsSearchScreen extends Component {
    constructor(props) {
        super(props);
        console.log('#hotel-search# 2.1/6  HotelSearchScreen constructor START');

        console.disableYellowBox = true;

        const { params } = this.props.navigation.state;//eslint-disable-line
        this.state = createInitialState(params);

        this.pageLimit = 6;
        this.socketDown = true;
        this.hotelsIndicesById = null; // see getHotels() for populating this one
        this.hotelsSocketCache = {}; // cache for hotels from socket, that are not present on screen (were not fetched by scrolling down the list)

        this.listViewHelpers = {}; // startFetch & abortFetch (see UltimateListView docs - react-native-ultimate-listview)

        // Bind functions to this,
        // thus optimising performance - by using bind(this) instead of "=> function".
        this.gotoHotelDetailsPageByMap = this.gotoHotelDetailsPageByMap.bind(this)
        this.saveState = this.saveState.bind(this)
        this.unsubscribe = this.stopSocketConnection.bind(this)
        this.renderListItem = this.renderListItem.bind(this)
        this.renderFooter = this.renderFooter.bind(this)
        this.onDataFromSocket = this.onDataFromSocket.bind(this)
        this.onStaticData = this.onStaticData.bind(this)
        this.onRefreshResultsOnListView = this.onRefreshResultsOnListView.bind(this)


        // TODO: Figure out calls and refreshes:
        //   (1) if getHotels() is needed to call after going back from map
        //       e.i. when toggling Map/List view
        //   (2) isMap - should it really be used as -1, 0, 1
        // this.dataSource = [];

        //TODO: @@debug - remove
        console.log('#hotel-search# 2.2/6 HotelSearchScreen constructor END');
        this.renderTimes = 0;
        this.renderItemTimes = 0;
    }

    componentDidMount() {
        console.log('#hotel-search# 3/6 HotelSearchScreen componentDidMount START');

        if (this.state.isHotel) {
            this.getHotels();
        }

        // TODO: Figure out why is this call used
        // It was initially called from the constructor body (why? how is it possible to work)
        this.saveState();
    }

    componentWillUnmount() {
        this.socketDown = true;
        this.stopSocketConnection();
    }

    getHotels() {
        console.log("#hotel-search# 4.1/6 [HotelsSearchScreen] getHotels");
                    
        this.hotelsIndicesById = {};
        const _this = this;
        
        this.setState(
            // change state function
            function(prevState, updatedProps) {
                //console.log('SET_STATE 1', {prevState,updatedProps})
                return {
                    isMAP: -1, // TODO: Value was -1, set to 0 to be able to work with whatever map behaviour was before
                               // Figure out how to work with Map logic and whether this var isMAP is needed
                    hotelsInfo : [],
                    allElements: false, 
                    editable: false
                }
            },

            // callback (after change state above)
            function() {
                //console.log('SET_STATE 2', {_th:this});
                requester
                    .getStaticHotels(_this.state.regionId)
                    .then(this.onStaticData)
            }
        );
        //console.log("#hotel-search# 4.2/6 [HotelsSearchScreen] getHotels");
    }

    // TODO: Inspect this flow - and create a component to implement it
    async startSocketConnection() {
        this.socketDown = false;

        this.uuid = await UUIDGenerator.getRandomUUID();

        // common code
        WebsocketClient.startGrouping();

        if (Platform.OS === 'ios') {
            this.stompiOSConnect();
        } else if (Platform.OS === 'android') {
            this.stompAndroidConnect();
        }
    }

    // TODO: Inspect this flow - and create a component to implement it
    stopSocketConnection(removeListeners = true) {
        // common code
        if (removeListeners) {
            WebsocketClient.stopGrouping();
            this.socketDown = true;
        }

        // platform specific
        if (Platform.OS === 'ios') {
            // TODO: Figure out why this is null sometimes
            if (stompiOSClient) {
                stompiOSClient.disconnect();
            }
        } else if (Platform.OS === 'android') {
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

    stompAndroidConnect() {
        stompAndroidClient = NativeModules.StompModule;

        //console.log("stompAndroid -------------");
        //console.log("stompAndroid---------------", this.uuid, this.searchString);
        const message = "{\"uuid\":\"" + this.uuid + "\",\"query\":\"" + this.searchString + "\"}";
        const destination = "search/" + this.uuid;

        DeviceEventEmitter.removeAllListeners("onStompConnect");
        DeviceEventEmitter.addListener("onStompConnect", () => {
            //console.log("onStompConnect -------------");
        });
        
        DeviceEventEmitter.removeAllListeners("onStompError");
        DeviceEventEmitter.addListener("onStompError", ({type, message}) => {
            //console.log("onStompError -------------", type, message);
        });

        DeviceEventEmitter.removeAllListeners("onStompMessage");
        DeviceEventEmitter.addListener("onStompMessage", ({message}) => {
            // console.warn('stomp message', message);
            // TODO: (low priority) Solve this difference between iOS and Android
            return this.onDataFromSocket({body:message})
        });

        stompAndroidClient.getData(message, destination);
    }

    onDoneSocket = (data) => {
        console.log(`#hotel-search# [HotelsSearchScreen] onDoneSocket, totalElements: ${data.totalElements}`)

        this.stopSocketConnection(false);

        this.setState({pricesFromSocket: data.totalElements})

        this.listViewHelpers.startFetch(this.state.hotelsInfo, this.pageLimit);
    }

    onCancel = () => {
        this.props.navigation.goBack();
    }

    onToggleMapOrListResultsView = () => {
        if (this.state.isMAP == 0) {
            this.setState({
                isMAP: 1,
                index: 1,
        });
        }
        else {
            this.setState({
                isMAP: 0,
                index: 0,
            });
            this.getHotels();
        }
    }

    gotoHotelDetailsPageByList = (item) => {
        //console.log("gotoHotelDetailsPage", item, this.searchString.substring(1), this.searchString.substring(1).split('&'));
        
        this.setState({isLoadingHotelDetails: true});
        requester.getHotelById(item.id, this.searchString.split('&')).then((res) => {
            //console.log("requester.getHotelById", res);
            // here you set the response in to json
            res.body.then((data) => {
                //console.log("requester.getHotelById data", data);
                const hotelPhotos = [];
                for (let i = 0; i < data.hotelPhotos.length; i++) {
                    hotelPhotos.push({ uri: imgHost + data.hotelPhotos[i].url });
                }
                this.setState({
                    isLoadingHotelDetails: false
                });
                this.props.navigation.navigate('HotelDetails', {
                    guests: this.state.guests,
                    hotelDetail: item,
                    searchString: this.searchString,
                    hotelFullDetails: data,
                    dataSourcePreview: hotelPhotos,
                    daysDifference: this.state.daysDifference
                });
            }).catch((err) => {
                //console.log(err);
            });
        });
    }

    gotoHotelDetailsPageByMap (item) {
        //console.log("gotoHotelDetailsPageByMap", item);

        this.setState({isLoadingHotelDetails: true});
        requester.getHotelById(item.id, this.searchString.split('&')).then((res) => {
            // here you set the response in to json
            res.body.then((data) => {
                const hotelPhotos = [];
                for (let i = 0; i < data.hotelPhotos.length; i++) {
                    hotelPhotos.push({ uri: imgHost + data.hotelPhotos[i].url });
                }
                this.setState({
                    isLoadingHotelDetails: false
                });
                this.props.navigation.navigate('HotelDetails', {
                    guests: this.state.guests,
                    hotelDetail: item,
                    searchString: this.searchString,
                    hotelFullDetails: data,
                    dataSourcePreview: hotelPhotos,
                    daysDifference: this.state.daysDifference
                });
            }).catch((err) => {
                //console.log(err);
            });
        });
    }
    
    onStaticData(res) {
        const _this = this;
        //console.log(` RESULT: ${res.success} `, {res})

        if (res.success) {
            res.body.then(function(data) {
                let hotels = data.content;
                updateHotelIdsMap(_this.hotelsIndicesById, hotels);
                updateHotelsFromSocketCache(hotels, _this.hotelsSocketCache)

                //TODO: @@debug
                /** console.log START *
                // console.log("#hotel-search# [HotelsSearchScreen]  STATIC DATA", data);
                console.log("#hotel-search# [HotelsSearchScreen] STATIC DATA " +
                    `first: ${data.first}, last: ${data.last}, number: ${data.number},`+
                    ` totalElements: ${data.totalElements}, totalPages: ${data.totalPages},` +
                    ` pageLimit for list: ${_this.pageLimit}`
                );
                console.log('#hotel-search# [HotelsSearchScreen] STATIC DATA, Hotels:');
                for (let i=0; i<hotels.length; i++) {
                    let item = hotels[i];
                    debugHotelData(item, _this.state.hotelsInfo, i, '.. STATIC DATA ..')
                }
                /* console.log END */

                if (_this.socketDown) {
                    _this.startSocketConnection();
                }

                _this.setState(
                    (prev) => {
                        return {
                            hotelsInfo: prev.hotelsInfo.concat(hotels),
                            totalHotels: data.totalElements
                        }
                    },
                    function() {
                        _this.listViewHelpers.startFetch(_this.state.hotelsInfo, _this.pageLimit);
                    }
                )
                
            })
        } else {
            console.error('[HotelsSearchScreen] Could not fetch Static Data for hotels')
            this.listViewHelpers.startFetch([], 0, true)
        }
    }


    // onFetch (page = 1, startFetch, abortFetch) {
    onRefreshResultsOnListView(page = 1, startFetch, abortFetch) {
        console.log(`#hotel-search# [HotelsSearchScreen] onFetch / onRefreshResultsOnListView, page:${page}`);

        // This is required to determinate whether the first loading list is all loaded.
    
        this.listViewHelpers = {startFetch, abortFetch};

        try {
            //console.log("### onFetch 0");

            if (this.state.isFilterResult) {
                //console.log("### onFetch 2.1");
                const strSearch = this.generateSearchString(this.state, this.props);
                const strFilters = this.getFilterString(this.listView.getPage());
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
            this.listViewHelpers.abortFetch() // manually stop the refresh or pagination if it encounters network error
        //   //console.log(err)
        }
    }

    onSearchHandler = (value) => {
        this.setState({ search: value });
        if (value === '') {
            this.setState({ cities: [] });
        } else {
            requester.getRegionsBySearchParameter([`query=${value}`]).then(res => {
                res.body.then(data => {
                    if (this.state.search != '') {
                        this.setState({ cities: data });
                    }
                });
            });
        }
    }

    gotoGuests = () => {
        this.props.navigation.navigate('GuestsScreen', {
            guests: this.state.guests,
            adults: this.state.adults,
            children: this.state.children,
            infants: this.state.infants,
            updateData: this.updateData,
            childrenBool: this.state.childrenBool
        });
    }

    gotoSearch = () => {
        this.setState({isFilterResult: false, isMAP: 0, index: 0}, () => {
            this.saveState();

            this.getHotels();
        });
    }

    gotoCancel = () => {
        this.setState(
        // TODO: Previous State was cached separately
        //       this was done in a non-react way, saving previousState
        //       as a static object. If needed - do it again instead of using prevState 
        //       as below it is suppossed to use in react-ways.
        //       as below it is suppossed to use in react-ways.
        // See: https://reactjs.org/docs/react-component.html#setstate
        function(prevState, updatedProps) {
                let baseInfo = {};
                baseInfo['adults'] = prevState.adults;
                baseInfo['children'] = [];
                for (let i = 0; i < prevState.children.children; i ++) {
                    baseInfo['children'].push({"age": 0});
                }
                let roomsData = [baseInfo];
                let roomsDummyData = encodeURI(JSON.stringify(roomsData));
                        
                return {
                    search: prevState.search,
                    regionId: prevState.regionId,

                    checkInDate: prevState.checkInDate,
                    checkInDateFormated: prevState.checkInDateFormated,
                    checkOutDate: prevState.checkOutDate,
                    checkOutDateFormated: prevState.checkOutDateFormated,
                    daysDifference: prevState.daysDifference,

                    adults: prevState.adults,
                    children: prevState.children,
                    infants: prevState.infants,
                    guests: prevState.guests,
                    childrenBool: prevState.childrenBool,
                    roomsDummyData: roomsDummyData,
                    
                    isNewSearch: false,
                }
            }
        );
    }

    handleAutocompleteSelect = (id, name) => {
        // TODO: Previous State was cached separately
        //       this was done in a non-react way, saving previousState
        //       as a static object. If needed - do it again instead of using prevState 
        //       as below it is suppossed to use in react-ways.
        // See: https://reactjs.org/docs/react-component.html#setstate
        this.setState(
            // change state function
            function(prevState, updatedProps) {
                let stateUpdate = {
                    cities: [],
                    search: name,
                    regionId: id
                };
                
                if (prevState.regionId == id) {
                    stateUpdate.isNewSearch = true
                }
            }
        );
    }

    
    onDatesSelect = ({ startDate, endDate, startMoment, endMoment }) => {
        const start = moment(startDate, 'ddd, DD MMM');
        const end = moment(endDate, 'ddd, DD MMM');
        this.setState({
            daysDifference: moment.duration(end.diff(start)).asDays(),
            checkInDate: startDate,
            checkOutDate: endDate,
            checkInDateFormated: startMoment.format('DD/MM/YYYY'),
            checkOutDateFormated: endMoment.format('DD/MM/YYYY'),
            isNewSearch: true
        });
    }

    updateData = (data) => {
        if (this.state.adults === data.adults
                && this.state.children === data.children
                && this.state.infants === data.infants
                && this.state.childrenBool === data.childrenBool) {
            return;
        }
        
        let baseInfo = {};
        baseInfo['adults'] = data.adults;
        baseInfo['children'] = [];
        for (let i = 0; i < data.children; i ++) {
            baseInfo['children'].push({"age": 0});
        }
        let roomsData = [baseInfo];
        let roomsDummyData = encodeURI(JSON.stringify(roomsData));

        this.setState({
            adults: data.adults,
            children: data.children,
            infants: data.infants,
            guests: data.adults + data.children + data.infants,
            childrenBool: data.childrenBool,
            roomsDummyData: roomsDummyData,
            isNewSearch: true
        });
    }

    saveState() {
        //console.log('#hotel-search# 5/6 HotelSearchScreen saveState END');

        this.setState(
            function(prevState, propsUpdated) {
                // TODO: Previous State was cached separately
                //       this was done in a non-react way, saving previousState
                //       as a static object. If needed - include it 
                // See: https://reactjs.org/docs/react-component.html#setstate
/*                
                prevState.search = this.state.search;
                prevState.regionId = this.state.regionId;

                prevState.checkInDate = this.state.checkInDate;
                prevState.checkInDateFormated = this.state.checkInDateFormated;
                prevState.checkOutDate = this.state.checkOutDate;
                prevState.checkOutDateFormated = this.state.checkOutDateFormated;
                prevState.daysDifference = this.state.daysDifference;

                prevState.adults = this.state.adults;
                prevState.children = this.state.children;
                prevState.infants = this.state.infants;
                prevState.guests = this.state.guests;
                prevState.childrenBool = this.state.childrenBool;
 */                
                return {
                    //filters
                    showUnAvailable: false,
                    nameFilter: '',
                    selectedRating: [false, false, false, false, false],
                    orderBy: 'rank,desc',
                    priceRange: [1, 5000],
                    isNewSearch: false,
                }
            }
        );

        if (this.state.isHotel) {
            this.searchString = generateSearchString(this.state, this.props);
        }
    }

    gotoSettings = () => {
        if (this.state.allElements) {
            if (this.state.isHotel) {
                this.props.navigation.navigate('HotelFilterScreen', {
                    isHotelSelected: true,
                    updateFilter: this.updateFilter,
                    selectedRating: this.state.selectedRating,
                    showUnAvailable: this.state.showUnAvailable,
                    hotelName: this.state.nameFilter
                });
            }
        }
    }

    mapStars(stars) {
        let hasStars = false;
        const mappedStars = [];
        stars.forEach((s) => {
            if (s) {
                hasStars = true;
            }
        });

        if (!hasStars) {
            for (let i = 0; i <= 5; i++) {
                mappedStars.push(i);
            }
        } else {
            mappedStars.push(0);
            stars.forEach((s, i) => {
                if (s) {
                    mappedStars.push(i + 1);
                }
            });
        }

        return mappedStars;
    }

    getFilterString = (page) => {
        const filtersObj = {
            showUnavailable: this.state.showUnAvailable,
            name: this.state.nameFilter,
            minPrice: this.state.priceRange[0],
            maxPrice: this.state.priceRange[1],
            stars: this.mapStars(this.state.selectedRating)
        };

        // const page = page;//this.listView.getPage();
        const sort = this.state.orderBy;
        const pagination = `&page=${page}&sort=${sort}`;
    
        let filters = `&filters=${encodeURI(JSON.stringify(filtersObj))}` + pagination; //eslint-disable-line
        
        return filters;
    }

    updateFilter = (data) => {
        //console.log("updateFilter", data);
        
        if (this.listView != undefined && this.listView != null) {
            this.listView.initListView();
        }

        if (this.mapView != undefined && this.mapView != null) {
            this.mapView.initMapView();
        }
        
        this.setState(
            // change state (object in this case)
            {
                isFilterResult: true,
                showUnAvailable: data.showUnAvailable,
                nameFilter: data.hotelName,
                selectedRating: data.selectedRating,
                orderBy: data.priceSort,
                priceRange: data.sliderValue,
                hotelsInfo: []
            }, 
            // callback (after change state above)
            function() {
                // this.applyFilters();
                const search = generateSearchString(this.state, this.props);
                const filters = this.getFilterString(0);
                ////console.log("search --- filters", search, filters);
                this.fetchFilteredResults(search, filters);
            }
        );
    }

    fetchFilteredResults = (strSearch, strFilters) => {
        let searchMap = strSearch + strFilters;
        //searchMap = searchMap.replace(/%22/g, '"');
        //console.log("fetchFilteredResults query", searchMap);
        //searchMap = '?region=15664&currency=USD&startDate=21/11/2018&endDate=22/11/2018&rooms=%5B%7B"adults":2,"children":%5B%5D%7D%5D&filters=%7B"showUnavailable":true,"name":"","minPrice":1,"maxPrice":5000,"stars":%5B0,1,2,3,4,5%5D%7D&page=0&sort=rank,desc';

        requester.getLastSearchHotelResultsByFilter(strSearch, strFilters).then((res) => {
            if (res.success) {
                res.body.then((data) => {
                    //console.log("fetchFilteredResults", data);
                    this.listView.onFirstLoad(data.content, true);
                    requester.getMapInfo(searchMap).then(res => {
                        res.body.then(dataMap => {
                            //console.log ("getMapInfo", dataMap);
                            const isCacheExpired = dataMap.isCacheExpired;
                            if (!isCacheExpired) {
                                this.setState({
                                    hotelsInfo: dataMap.content, 
                                    initialLat: parseFloat(dataMap.content[0].latitude), 
                                    initialLon: parseFloat(dataMap.content[0].longitude)
                                });
                            }
                            else {
                                this.setState({
                                    hotelsInfo: data.content, 
                                    initialLat: parseFloat(data.content[0].latitude), 
                                    initialLon: parseFloat(data.content[0].longitude)
                                });
                            }
                        });
                    });
                });
            } 
            else {
                // //console.log('Search expired');
            }
        });
        

    }

    renderBackButtonAndSearchField() {
        return (
            <View style={styles.SearchAndPickerwarp}>
                <View style={styles.searchAreaView}>
                    <SearchBar
                        autoCorrect={false}
                        value={this.state.search}
                        onChangeText={this.onSearchHandler}
                        placeholder="Discover your next experience"
                        placeholderTextColor="#bdbdbd"
                        leftIcon="arrow-back"
                        onLeftPress={this.onCancel}
                        editable={this.state.editable}
                    />
                </View>
            </View>
        );
    }

    renderCalendarAndFilters() {
        return (
            <View style={[this.state.isNewSearch ?  {height:190, width:'100%'} : {height:70, width:'100%'},
                {borderBottomWidth:1}
            ]}>
                <DateAndGuestPicker
                    checkInDate={this.state.checkInDate}
                    checkOutDate={this.state.checkOutDate}
                    checkInDateFormated={this.state.checkInDateFormated}
                    checkOutDateFormated={this.state.checkOutDateFormated}
                    adults={this.state.adults}
                    children={this.state.children}
                    infants={this.state.infants}
                    guests={this.state.guests}
                    gotoGuests={this.gotoGuests}
                    gotoSearch={this.gotoSearch}
                    gotoCancel={this.gotoCancel}
                    onDatesSelect={this.onDatesSelect}
                    gotoSettings={this.gotoSettings}
                    disabled={!this.state.editable}
                    showSearchButton={this.state.isNewSearch}
                    showCancelButton={this.state.isNewSearch}
                    isFilterable={true}
                />
            </View>
        );
    }

    renderPaginationFetchingView = () => (
        <View style={{width, height:height - 160, justifyContent: 'center', alignItems: 'center'}}>
            <Image style={{width:50, height:50}} source={require('../../../../assets/loader.gif')}/>
        </View>
    )
    
    renderPaginationWaitingView = () => {
        return (
            <View style={
                {
                    flex: 0,
                    width,
                    height: 55,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }
            }>
                <DotIndicator color='#d97b61' count={3} size={9} animationDuration={777}/>
            </View>
        )
    }

    renderPaginationAllLoadedView = () => {
        return (<View/>)
    }

    renderFooter = () => {
        const {commonText} = require('../../../../common.styles');
        
        return (
            <View style={{width:'100%', height:30,
                flexDirection:'row',
                justifyContent: 'space-evenly',
                alignItems: 'flex-end',
                borderTopWidth: 1,
                borderColor: '#000',
                paddingBottom: 5
            }}>
                <Text style={{...commonText, fontSize:12, fontWeight: 'normal', textAlign: 'left'}}>
                    {
                        lang.TEXT.SEARCH_HOTEL_RESULTS_PRICES.replace('$$1',
                                this.state.pricesFromSocket > 0
                                    ? `${this.state.pricesFromSocketValid}/${this.state.pricesFromSocket}`
                                    : `${this.state.pricesFromSocketValid}`
                    )}
                </Text>
                <Text style={{...commonText, fontSize:12, fontWeight: 'normal', textAlign: 'right'}}>
                    {lang.TEXT.SEARCH_HOTEL_RESULTS_FOUND.replace('$$1',
                        `${this.state.hotelsInfo.length}/${this.state.totalHotels}`
                    )}
                </Text>
            </View>
        )
    }

    renderListItem = (item, index) => {
        this.renderItemTimes++;
        // console.log(`    #hotel-search# [HotelsSearchScreen] renderListItem id: ${item.id}, index: ${index}, renderItemTimes: ${this.renderItemTimes}`)

        return (
            <HotelItemView
                item = {item}
                gotoHotelDetailsPage = {this.gotoHotelDetailsPageByList}
                daysDifference = {this.state.daysDifference}
                isDoneSocket = {this.state.allElements}
                parent = {this}
            />
        )
    }

    renderResultsAsList () {
        // //console.log(`### [HotelsSearchScreen] renderResultsAsList`)

        return <UltimateListView
                    ref = {ref => this.listView = ref}
                    key = {'hotelsList'} // this is important to distinguish different FlatList, default is numColumns
                    onFetch = {this.onRefreshResultsOnListView}
                    keyExtractor = {(item, index) => {
                        // //console.log(`### [HotelsSearchScreen] item:${item}: index:${index}`)
                        return `${index} - ${item}`
                        }
                    } // this is required when you are using FlatList
                    firstLoader = { true }
                    refreshableMode = { 'basic' }
                    data = {this.state.hotelsInfo}
                    numColumns = {1} // to use grid layout, simply set gridColumn > 1
                    autoPagination
                    item = {this.renderListItem} // this takes three params (item, index, separator)
                    paginationFetchingView = {this.renderPaginationFetchingView}
                    paginationWaitingView = {this.renderPaginationWaitingView}
                    paginationAllLoadedView = {this.renderPaginationAllLoadedView}
                />
    }

    renderResultsAsMap() {
        return ( 
            <MapModeHotelsSearch
                ref={ref => 
                    {
                        if (!!ref) {
                            this.mapView = ref.getWrappedInstance()
                        }
                    }
                }
                isFilterResult = {this.state.isFilterResult}
                initialLat = {this.state.initialLat}
                initialLon = {this.state.initialLon}
                daysDifference = {this.state.daysDifference}
                hotelsInfo = {this.state.hotelsInfo}
                gotoHotelDetailsPage = {this.gotoHotelDetailsPageByMap} />
        )
    }

    renderMapButton() {
        return (
            this.state.isMAP != -1 &&
                <TouchableOpacity onPress={this.onToggleMapOrListResultsView} style={styles.switchButton}>
                    <FontAwesome style={styles.icon}>{this.state.isMAP == 0 ? Icons.mapMarker : Icons.listUl}</FontAwesome>
                </TouchableOpacity>    
        )
    }

    render() {
        // TODO: @@debug - remove this
        // this.renderTimes++;
        //if (this.renderTimes <= 20)
        // console.log(`#hotel-search# 6/6 HotelSearchScreen render #${this.renderTimes}`);

        // console.log(`### [HotelsSearchScreen] index: ${this.state.index}`,{all:this.state.allElements});

        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    { this.renderBackButtonAndSearchField() }
                    { this.renderCalendarAndFilters()       }

                    <View style={styles.containerHotels}>
                        { 
                            (this.state.index == 0)
                                ? this.renderResultsAsList()
                                : this.renderResultsAsMap()
                        }

                        {/* DISABLED FOR NOW */}
                        {/* { this.renderMapButton()           } */}

                    </View>

                    { this.renderFooter()               }

                    <ProgressDialog
                        visible={this.state.isLoadingHotelDetails}
                        title="Please Wait"
                        message="Loading..."
                        animationType="slide"
                        activityIndicatorSize="large"
                        activityIndicatorColor="black"/>
                </View>
            </SafeAreaView>
        );
    }

    stompiOSConnect() {
        //console.log("stompiOSConnect ---------------");

        stompiOSClient = stomp.client(socketHost);
        stompiOSClient.debug = null;
        stompiOSClient.connect({}, (frame) => {
            var headers = {'content-length': false};
            stompiOSClient.subscribe(`search/${this.uuid}`, this.onDataFromSocket);
            stompiOSClient.send("search",
                headers,
                JSON.stringify({uuid: this.uuid, query : this.searchString})
            )
        }, (error) => {
            stompiOSClient.disconnect();
            this.setState({
                isLoading: false,
            });
        });
    }

    setInitialPositionOnMap() {
        if (this.state.isMAP == -1 && this.state.hotelsInfo.length > 0) {
            this.setState({
                isMAP: 0, 
                initialLat: parseFloat(this.state.hotelsInfo[0].lat), 
                initialLon: parseFloat(this.state.hotelsInfo[0].lon)
            });
        }
    }
    
    onDataFromSocket(data) {
        this.setInitialPositionOnMap();

        const {body} = data;
        // try {
            const parsedData = JSON.parse(body);

/*             
            console.debug("#hotel-search# [HotelsSearchScreen] stomp - onDataFromSocket ---", 
                {body,data,parsedData,_th: this}
            );
 */

            if (parsedData.hasOwnProperty('allElements')) {
                // TODO: @@debug - remove
                // console.warn(`#hotel-search# [HotelsSearchScreen] onDataFromSocket, DONE`, parsedData);

                if (parsedData.allElements) {
                    this.setState({ allElements: true, editable: true});
                    this.onDoneSocket(parsedData);
                }
            } else {
                let hotelData = parsedData;
                // TODO: @@debug - remove
                // console.warn(`#hotel-search# [HotelsSearchScreen] onDataFromSocket, id:${hotelData.id} name:${hotelData.name}, pic:${hotelData.hotelPhoto}, price:${hotelData.price}`);

                this.setState(
                    // change state function
                    function(prevState, updatedProps) {
                        // Checking if this is HotelsSearchScreen
                        // console.log(`#hotel-search# [HotelsSearchScreen::onDataFromSocket -> setState::func] this instanceof isHotelSearchScreen: ${this instanceof HotelsSearchScreen}`);
                        
                        if (this.socketDown) {
                            return prevState;
                        } else {
                            let result = {
                                hotelsInfo: updateHotelFromSocket(hotelData, this.hotelsSocketCache, this.hotelsIndicesById, prevState, updatedProps)
                            }
                            if (hotelData.price && !isNaN(hotelData.price)) {
                                result.pricesFromSocketValid = prevState.pricesFromSocketValid+1;
                            }
                            return result;
                        }
                    },
                    // callback (after change state above)
                    function() {
                        // Checking if this is HotelsSearchScreen
                        // console.log(`#hotel-search# [HotelsSearchScreen::onDataFromSocket -> setState::callback] this instanceof isHotelSearchScreen: ${this instanceof HotelsSearchScreen}`);
                        
                        if (this.state.isMAP === 1 
                            && this.mapView != null 
                            && this.state.hotelsInfo.length % 20 === 0)
                        {
                            this.mapView.refresh(this.state.hotelsInfo);
                        }
                    }
                );
            }
        // } catch (e) {
            // console.error("ERROR on socket Message", {message, e});
            // Error
        // }        
    }
}

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency
    };
}
export default connect(mapStateToProps, null)(HotelsSearchScreen);