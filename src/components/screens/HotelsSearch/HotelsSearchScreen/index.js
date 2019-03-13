import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, ScrollView, TouchableOpacity, View, Platform, NativeModules, DeviceEventEmitter, Dimensions } from 'react-native';

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

import styles from './styles';
import { createInitialState, updateIds, generateSearchString } from './utils';

const { width, height } = Dimensions.get('window')

let stompiOSClient = undefined;
const stompAndroidClient = NativeModules.StompModule;
const stomp = require('stomp-websocket-js');

class HotelsSearchScreen extends Component {
    constructor(props) {
        super(props);
        console.disableYellowBox = true;

        const { params } = this.props.navigation.state;//eslint-disable-line
        this.state = createInitialState(params);

        this.pageLimit = 6;
        this.socketDown = true;
        this.hotelsIndicesById = null; // see getHotels() for populating this one

        this.listViewHelpers = {}; // startFetch & abbortFetch (see UltimateListView docs - react-native-ultimate-listview)

        // Bind functions to this,
        // thus optimising performance - by using bind(this) instead of "=> function".
        this.gotoHotelDetailsPageByMap = this.gotoHotelDetailsPageByMap.bind(this)
        this.saveState = this.saveState.bind(this)
        this.unsubscribe = this.stopSocketConnection.bind(this)
        this.onDataFromSocket = this.onDataFromSocket.bind(this)
        this.onStaticData = this.onStaticData.bind(this)
        this.onRefreshResultsOnListView = this.onRefreshResultsOnListView.bind(this)


        // TODO: Figure out calls and refreshes:
        //   (1) if getHotels() is needed to call after going back from map
        //       e.i. when toggling Map/List view
        //   (2) isMap - should it really be used as -1, 0, 1
        // this.dataSource = [];
    }

    componentDidMount() {
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
        console.log("### [HotelsSearchScreen] getHotels", {listView:this.listView});
                    
        this.hotelsIndicesById = {};
        this.setState(
            // change state function
            function(prevState, updatedProps) {
                // console.log('SET_STATE 1', {prevState,updatedProps})
                return {
                    isMAP: 0, // TODO: Value was -1, set to 0 to be able to work with whatever map behaviour was before
                            // Figure out how to work with Map logic and whether this var isMAP is needed
                    hotelsInfo : [],
                    allElements: false, 
                    editable: false
                }
            },

            // callback (after change state above)
            function() {
                // console.log('SET_STATE 2', {_th:this});
                requester.getStaticHotels(this.state.regionId).then(res => {
                    res.body.then(data => {
                        console.log("### [HotelsSearchScreen][SERVER] getStaticHotels", data);
        
                        if (this.socketDown) {
                            this.startSocketConnection();
                        }
                    });
                }
            );
        });
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
            stompiOSClient.disconnect();
        } else if (Platform.OS === 'android') {
            if (removeListeners) {
                DeviceEventEmitter.removeAllListeners("onStompConnect");
                DeviceEventEmitter.removeAllListeners("onStompError");
                DeviceEventEmitter.removeAllListeners("onStompMessage");
            }

            stompAndroidClient.close();
        }
    }

    stompAndroidConnect() {
        // console.log("stompAndroid -------------");
        // console.log("stompAndroid---------------", this.uuid, this.searchString);
        const message = "{\"uuid\":\"" + this.uuid + "\",\"query\":\"" + this.searchString + "\"}";
        const destination = "search/" + this.uuid;

        DeviceEventEmitter.removeAllListeners("onStompConnect");
        DeviceEventEmitter.addListener("onStompConnect", () => {
            console.log("onStompConnect -------------");
        });
        
        DeviceEventEmitter.removeAllListeners("onStompError");
        DeviceEventEmitter.addListener("onStompError", ({type, message}) => {
            console.log("onStompError -------------", type, message);
        });

        DeviceEventEmitter.removeAllListeners("onStompMessage");
        DeviceEventEmitter.addListener("onStompMessage", ({message}) => {
            console.warn('stomp message', message);
            // TODO: (low priority) Solve this difference between iOS and Android
            return this.onDataFromSocket({body:message})
        });

        stompAndroidClient.getData(message, destination);
    }

    onDoneSocket = (data) => {
        console.log('onDoneSocket', {data})

        this.stopSocketConnection(false);

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
        console.log("gotoHotelDetailsPage", item, this.searchString.substring(1), this.searchString.substring(1).split('&'));
        
        this.setState({isLoadingHotelDetails: true});
        requester.getHotelById(item.id, this.searchString.split('&')).then((res) => {
            console.log("requester.getHotelById", res);
            // here you set the response in to json
            res.body.then((data) => {
                console.log("requester.getHotelById data", data);
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
                console.log(err);
            });
        });
    }

    gotoHotelDetailsPageByMap (item) {
        console.log("gotoHotelDetailsPageByMap", item);
        
        if (item.price == null || item.price == undefined) {
            return;
        }

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
                console.log(err);
            });
        });
    }
    
    onStaticData(res) {
        const _this = this;
        if (res.success) {
            res.body.then((data) => {
                let hotels = data.content;
                updateIds(this.hotelsIndicesById,hotels);
                _this.setState(
                    {hotelsInfo:hotels},
                    function() {
                        _this.listViewHelpers.startFetch(_this.state.hotelsInfo, _this.pageLimit);
                    }
                )
                
            })
        } else {
            this.listViewHelpers.startFetch([], 0, true)
        }
    }
    // onFetch (page = 1, startFetch, abortFetch) {
    onRefreshResultsOnListView(page = 1, startFetch, abortFetch) {
        console.log("### [HotelsSearchScreen] onFetch / onRefreshResultsOnListView", page);

        // This is required to determinate whether the first loading list is all loaded.
    
        this.listViewHelpers = {startFetch, abortFetch};

        try {
            console.log("### onFetch 0");

            if (!this.state.isFilterResult) {
                console.log("### onFetch 1.1");
                requester
                    .getStaticHotels(this.state.regionId, page - 1)
                    .then(this.onStaticData);
            } else {
                console.log("### onFetch 2.1");
                const strSearch = this.generateSearchString(this.state, this.props);
                const strFilters = this.getFilterString(this.listView.getPage());
                requester
                    .getLastSearchHotelResultsByFilter(strSearch, strFilters)
                    .then(this.onStaticData);
            }            
        } catch (err) {
            console.log("### onFetch Error", err);
            console.log("onFetch--=- error  ", err);
            this.listViewHelpers.abortFetch() // manually stop the refresh or pagination if it encounters network error
        //   console.log(err)
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
        console.log("updateFilter", data);
        
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
                //console.log("search --- filters", search, filters);
                this.fetchFilteredResults(search, filters);
            }
        );
    }

    fetchFilteredResults = (strSearch, strFilters) => {
        let searchMap = strSearch + strFilters;
        //searchMap = searchMap.replace(/%22/g, '"');
        console.log("fetchFilteredResults query", searchMap);
        //searchMap = '?region=15664&currency=USD&startDate=21/11/2018&endDate=22/11/2018&rooms=%5B%7B"adults":2,"children":%5B%5D%7D%5D&filters=%7B"showUnavailable":true,"name":"","minPrice":1,"maxPrice":5000,"stars":%5B0,1,2,3,4,5%5D%7D&page=0&sort=rank,desc';

        requester.getLastSearchHotelResultsByFilter(strSearch, strFilters).then((res) => {
            if (res.success) {
                res.body.then((data) => {
                    console.log("fetchFilteredResults", data);
                    this.listView.onFirstLoad(data.content, true);
                    requester.getMapInfo(searchMap).then(res => {
                        res.body.then(dataMap => {
                            console.log ("getMapInfo", dataMap);
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
                // console.log('Search expired');
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
            <View style={this.state.isNewSearch ?  {height:190, width:'100%'} : {height:70, width:'100%'}}>
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

    renderListItem = (item, index) => {
        // console.log(`### [HotelsSearchScreen] renderListItem`,{item,index})

        return (
            <HotelItemView
                item = {item}
                gotoHotelDetailsPage = {this.gotoHotelDetailsPageByList}
                daysDifference = {this.state.daysDifference}
                isDoneSocket = {this.state.allElements}
            />
        )
    }

    renderResultsAsList () {
        // console.log(`### [HotelsSearchScreen] renderResultsAsList`)

        return <UltimateListView
                    ref = {ref => this.listView = ref}
                    key = {'hotelsList'} // this is important to distinguish different FlatList, default is numColumns
                    onFetch = {this.onRefreshResultsOnListView}
                    keyExtractor = {(item, index) => {
                        // console.log(`### [HotelsSearchScreen] item:${item}: index:${index}`)
                        return `${index} - ${item}`
                        }
                    } // this is required when you are using FlatList
                    firstLoader = { true }
                    refreshableMode = { 'advanced' }
                    item = {this.renderListItem} // this takes three params (item, index, separator)
                    data = {this.state.hotelsInfo}
                    numColumns = {1} // to use grid layout, simply set gridColumn > 1
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
        // console.log(`### [HotelsSearchScreen] index: ${this.state.index}`,{all:this.state.allElements});

        return (
            <View style={styles.container}>
                { this.renderBackButtonAndSearchField() }

                <View style={{position: 'absolute', top: 100, left: 0, right: 0, bottom: 0, width:'100%'}}>
                    { this.renderCalendarAndFilters() }

                    <View style={styles.containerHotels}>
                        { 
                            (this.state.index == 0)
                                ? this.renderResultsAsList()
                                : this.renderResultsAsMap()
                        }

                        {/* DISABLED FOR NOW */}
                        {/* { this.renderMapButton()           } */}

                    </View>
                </View>

                <ProgressDialog
                    visible={this.state.isLoadingHotelDetails}
                    title="Please Wait"
                    message="Loading..."
                    animationType="slide"
                    activityIndicatorSize="large"
                    activityIndicatorColor="black"/>
            </View>
        );
    }

    stompiOSConnect() {
        console.log("stompiOSConnect ---------------");

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
        if (this.state.isMAP == -1 && this.state.hotelsInfo.length == 1) {
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
            console.debug("[HotelsSearchScreen] stomp - onDataFromSocket ---", 
                {body,data,parsedData,_th: this}
            );
 */

            if (parsedData.hasOwnProperty('allElements')) {
                if (parsedData.allElements) {
                    this.setState({ allElements: true, editable: true});
                    this.onDoneSocket(parsedData);
                }
            } else {
                let hotelData = parsedData;

                // TODO: Remove this commented out code if it is indeed obsolete
                //       It is some inherited old code - was commented out.
                //if (this.listView != null && (this.state.hotelsInfo.length < this.listView.getRows().length || this.state.hotelsInfo.length % 20 === 0)) {
                    // this.setState(prevState => ({
                    //     hotelsInfo: [...prevState.hotelsInfo, jsonHotel]
                    // }));
                    //this.state.hotelsInfo = [...this.state.hotelsInfo, jsonHotel];
                    //this.setState({refresh: this.state.hotelsInfo.length})

                this.setState(
                    // change state function
                    function(prev, props) {
                        if (this.socketDown) {
                            return null;
                        } else {
                            let hotelsInfo = [...prev.hotelsInfo];
                            let index = this.hotelsIndicesById[hotelData.id];
                            if (index != null) {
                                // hotel exists in state - update it
                                hotelData = Object.assign({},hotelsInfo[index], hotelData);
                                hotelsInfo[index] = hotelData;
                            } else {
                                // hotel data not present in state - add it
                                index = prevHotels.length;
                                this.hotelsIndicesById[hotelData.id] = index;
                                hotelsInfo.push(hotelData);
                            }
                            
                            return {
                                hotelsInfo
                            }
                        }
                    },
                    // callback (after change state above)
                    function() {
                        
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