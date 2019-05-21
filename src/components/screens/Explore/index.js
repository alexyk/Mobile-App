import {
    AsyncStorage,
    Image,
    ScrollView,
    StyleSheet,
    Text, 
    TouchableOpacity,
    View, SafeAreaView,
    Keyboard, Platform
} from 'react-native';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';

import DateAndGuestPicker from '../../organisms/DateAndGuestPicker';
import RNPickerSelect from 'react-native-picker-select';//eslint-disable-line
import SearchBar from '../../molecules/SearchBar';
import Toast from 'react-native-easy-toast';//eslint-disable-line
import { domainPrefix } from '../../../config';
import { autoHotelSearch, autoHotelSearchFocus, autoHotelSearchPlace,
    isOnline, autoHomeSearch,
} from '../../../config-debug';
import requester from '../../../initDependencies';
import styles from './styles';
import lang from '../../../language';
import { userInstance } from '../../../utils/userInstance';
import SingleSelectMaterialDialog from '../../atoms/MaterialDialog/SingleSelectMaterialDialog';


import LocRateButton from '../../atoms/LocRateButton'
import { setCurrency } from '../../../redux/action/Currency'

import {isNative} from '../../../version'
import { gotoWebview } from '../utils';
const isExploreSearchNative = isNative.explore; // false: webview version, true: native search version
const BASIC_CURRENCY_LIST = ['EUR', 'USD', 'GBP'];//eslint-disable-line

class Explore extends Component {
    static self;
    constructor(props) {
        super(props);

        const startDate = moment().add(1, 'day');
        const endDate = moment().add(2, 'day');

        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateFilter = this.updateFilter.bind(this);
        this.gotoGuests = this.gotoGuests.bind(this);
        this.gotoSettings = this.gotoSettings.bind(this);
        this.gotoSearch = this.gotoSearch.bind(this);
        this.renderAutocomplete = this.renderAutocomplete.bind(this);
        this.handleAutocompleteSelect = this.handleAutocompleteSelect.bind(this);
        this.handlePopularCities = this.handlePopularCities.bind(this);
        this.onDatesSelect = this.onDatesSelect.bind(this);
        this.onSearchHandler = this.onSearchHandler.bind(this);
        this.onSearchEnterKey = this.onSearchEnterKey.bind(this);

        let roomsData = [{
            adults: 2,
            children: []
        }];

        this.state = {
            isHotel: true,
            countryId: 0,
            countryName: '',
            value: '',
            countries: [],
            cities: [],
            search: '',
            regionId: '',
            checkInDateMoment: startDate,
            checkInDate: startDate.format('ddd, DD MMM').toString(),
            checkInDateFormated: startDate.format('DD/MM/YYYY').toString(),
            daysDifference: 1,
            checkOutDateMoment: endDate,
            checkOutDate: endDate.format('ddd, DD MMM').toString(),
            checkOutDateFormated: endDate.format('DD/MM/YYYY').toString(),
            guests: 2,
            adults: 2,
            children: 0,
            infants: 0,
            roomsDummyData: encodeURI(JSON.stringify(roomsData)),
            filter: {
                showUnavailable: true, name: '', minPrice: 1, maxPrice: 5000, stars: [0, 1, 2, 3, 4, 5]
            },
            count: {
                beds: 2,
                bedrooms: 0,
                bathrooms: 0
            },
            childrenBool: false,
            currency: props.currency,//eslint-disable-line
            currencySign: props.currencySign,//eslint-disable-line
            email: '',
            token: '',
            countriesLoaded: false,
            currencySelectionVisible: false,
        };
        // this.props.actions.getCurrency(props.currency, false);//eslint-disable-line
        Explore.self = this;

        // this.testWS();
    }


    async componentWillMount() {
        const token_value = await AsyncStorage.getItem(`${domainPrefix}.auth.locktrip`);
        const email_value = await AsyncStorage.getItem(`${domainPrefix}.auth.username`);
        this.setState({
            token: token_value,
            email: email_value,
        });

        if (__DEV__ && autoHotelSearchFocus) {
            this.searchBarRef.focus()
        }

        // Below line gives null cannot be casted to string error on ios please look into it
        requester.getUserInfo().then((res) => {
            res.body.then((data) => {
                if (email_value == undefined || email_value == null || email_value == "") {
                    AsyncStorage.setItem(`${domainPrefix}.auth.username`, data.email);
                    this.setState({
                        email: email_value,
                    });
                }
                userInstance.setUserData(data);
            }).catch((err) => {
                //console.log('componentWillMount', err);
            });
        });
        this.setCountriesInfo();
    }

    async componentDidMount() {
        console.disableYellowBox = true;

        // enable automatic search
        if (__DEV__ && autoHotelSearch) {
            setTimeout(() => {this.onSearchHandler(autoHotelSearchPlace)}, 100)
            if (!isOnline) {
                setTimeout(() => this.gotoSearch(), 300)
            }
        }
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        const {countries, currency, currencySign} = this.props;

        if (currency != prevProps.currency) {
            this.setState({ currency: currency, currencySign: currencySign });
        }

        if (countries != prevProps.countries) {
            this.setCountriesInfo();
        }

        if (__DEV__ && autoHotelSearchFocus && this.searchBarRef) {
            this.searchBarRef.focus()
        }
    }

    // componentWillUnmount() {
    //     // Websocket.sendMessage(this.props.exchangeRatesInfo.locRateFiatAmount, 'unsubscribe');
    // }

    setCountriesInfo() {
        let countryArr = [];
        this.props.countries.map((item, i) => {
            countryArr.push({
                label: item.name,
                value: item
            });
        });
        this.setState({
            countries: countryArr,
            countriesLoaded: true,
            countryId: countryArr[0].value.id,
            countryName: countryArr[0].label
        });
    }

    onChangeHandler(property) {
        return (value) => {
            this.setState({ [property]: value });
        };
    }

    onDatesSelect(params) {
        const { startDate, endDate, startMoment, endMoment } = params;
        const year = (new Date()).getFullYear();
        const start = moment(startDate, 'ddd, DD MMM, YYYY');
        const end = moment(endDate, 'ddd, DD MMM');
        const daysDifference = moment.duration(endMoment.diff(startMoment)).asDays();

        //logd('date-select',`year:${year} start:${start}(${typeof(start)}) end:${daysDifference}(${typeof(daysDifference)})`,{daysDifference,year,start,end,params,typrOfStartDate:`${typeof(startDate)}, ${startDate.prototype}`})

        this.setState({
            daysDifference,
            checkInDate: startDate,
            checkOutDate: endDate,
            checkInDateFormated: startMoment.format('DD/MM/YYYY'),
            checkOutDateFormated: endMoment.format('DD/MM/YYYY'),
        });
    }
    
    onSearchEnterKey(event) {
        if (this.state.cities.length > 0) {
            const {id, query} = this.state.cities[0];
            // console.tron.log(`[Explore] onSearchEnterKey: ${query}, id: ${id}`);
            this.handleAutocompleteSelect(id, query, this.gotoSearch);
        }
    }

    onSearchHandler(value) {
        this.setState({ search: value });
        if (value === '') {
            this.setState({ cities: [] });
        } else {
            requester.getRegionsBySearchParameter([`query=${value}`]).then(res => {
                res.body.then(data => {
                    if (this.state.search != '') {
                        this.setState(
                            { cities: data },
                            () => {
                                // enable automatic search
                                if (__DEV__ && autoHotelSearch) {
                                    setTimeout(() => {
                                            const {id, query} = data[0];
                                            //logd('citites','citites',{data,id,query})
                                            this.handlePopularCities(id, query);
                                            setTimeout(() => this.gotoSearch(), 100)
                                        },
                                        500
                                    )
                                }
                            }  
                        );                        
                    }
                });
            });
        }
    }

    onValueChange = (value) => {
        //console.log(value);
        //console.log(this.state.loc);
    };

    updateData(data) {
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
            roomsDummyData: roomsDummyData
        });
    }

    updateFilter(data) {
        // this.setState({
        //     isHotelSelected: data.isHotelSelected,
        //     count: data.count
        // });
    }

    gotoGuests() {
        this.props.navigation.navigate('GuestsScreen', {
            guests: this.state.guests,
            adults: this.state.adults,
            children: this.state.children,
            infants: this.state.infants,
            updateData: this.updateData,
            childrenBool: this.state.childrenBool
        });
    }

    gotoSettings() {
        // this.props.navigation.navigate('FilterScreen', {
        //     isHotelSelected: this.state.isHotel,
        //     count: this.state.count,
        //     updateFilter: this.updateFilter,
        //     searchedCity: this.state.search,
        //     searchedCityId: 72,
        //     checkInDate: this.state.checkInDate,
        //     checkOutDate: this.state.checkOutDate,
        //     guests: this.state.guests,
        //     adults: this.state.adults,
        //     children: this.state.children,
        //     regionId: this.state.regionId,
        //     currency: this.state.currency,
        //     checkOutDateFormated: this.state.checkOutDateFormated,
        //     checkInDateFormated: this.state.checkInDateFormated,
        //     roomsDummyData: this.state.roomsDummyData//encodeURI(JSON.stringify())
        // });
    }

    gotoSearch() {
        const delayedFunction = () => {
            console.log(`#hotel-search# 1/5 gotoSearch, ${this.state.checkOutDateFormated}, ${this.state.checkInDateFormated}`);
            //Open new property screen that uses sock-js
            if (isExploreSearchNative) {
                if (this.state.isHotel) {
                    //console.log("this.state.regionId.", this.state.regionId);
                    if (this.state.regionId === "" || this.state.regionId === 0) {
                        this.refs.toast.show('Please input location to search hotels.', 2500);
                        return;
                    }
                    this.props.navigation.navigate('HotelsSearchScreen', {
                        isHotel: this.state.isHotel,
                        searchedCity: this.state.search,
                        regionId: this.state.regionId,
                        checkInDate: this.state.checkInDate,
                        checkOutDate: this.state.checkOutDate,
                        guests: this.state.guests,
                        adults: this.state.adults,
                        children: this.state.children,
                        infants: this.state.infants,
                        childrenBool: this.state.childrenBool,
                        checkOutDateFormated: this.state.checkOutDateFormated,
                        checkInDateFormated: this.state.checkInDateFormated,
                        roomsDummyData: this.state.roomsDummyData, //encodeURI(JSON.stringify(this.state.roomsData)),
                        daysDifference: this.state.daysDifference,
                        token: this.state.token,
                        email: this.state.email,
                    });
                }
                else {
                    //console.log("this.state.value.", this.state.value);
                    if (this.state.value === '' || this.state.value === 0) {
                        this.refs.toast.show('Please select country to book home.', 2500);
                        return;
                    }
                    this.props.navigation.navigate('HomesSearchScreen', {
                        countryId: this.state.countryId,
                        home: this.state.value,
                        checkInDate: this.state.checkInDate,
                        checkOutDate: this.state.checkOutDate,
                        guests: this.state.guests,
                        adults: this.state.adults,
                        children: this.state.children,
                        infants: this.state.infants,
                        childrenBool: this.state.childrenBool,
                        checkOutDateFormated: this.state.checkOutDateFormated,
                        checkInDateFormated: this.state.checkInDateFormated,
                        roomsDummyData: this.state.roomsDummyData, //encodeURI(JSON.stringify(this.state.roomsData)),
                        daysDifference: this.state.daysDifference
                    });
                }
            }
            else {
                if (this.state.isHotel && this.state.regionId == '') {
                    //Empty location
                    this.refs.toast.show('Please input location to search hotels.', 2500);
                    this.setState({ search: '' });
                }
                else if (!this.state.isHotel && this.state.value === '') {
                    this.refs.toast.show('Please select country to book home.', 2500);
                    return;
                }
                else {
                    const {props,state} = this;
                    const extraParams = {
                        token: state.token,
                        email: state.email,
                        message: this.state.isHotel
                            ? `Looking for hotels in\n"${state.search}"`
                            : `Looking for homes in\n"${state.search}"`,
                        title: this.state.isHotel
                            ? lang.TEXT.SEARCH_HOTEL_RESULTS_TILE
                            : lang.TEXT.SEARCH_HOME_RESULTS_TILE,
                        isHotel: this.state.isHotel
                        
                    }
                    gotoWebview(state, props.navigation, extraParams);
                }
            }
        }

        // leave execution time for animation and search button release
        setTimeout(delayedFunction, 100);
    }

    handleAutocompleteSelect(id, name, callback=null) {
        this.setState({
                cities: [],
                search: name,
                regionId: id
            },
            () => (callback ? callback() : null) // execute callback after setting state - for dev needs mostly if calling this on Enter key in __DEV__
        );
    }

    handlePopularCities(id, name) {
        this.setState(
            () => ({
                cities: [],
                search: name,
                regionId: id,
                isHotel: true
            }),
            () => Keyboard.dismiss()
        );
    }

    renderAutocomplete() {
        const nCities = this.state.cities.length;
        if (nCities > 0) {
            return (
                <ScrollView
                    style={{
                        marginLeft: 15,
                        marginRight: 15,
                        minHeight: 100,
                        zIndex: 99,
                    }}
                >
                    {
                        this.state.cities.map((result, i) => { //eslint-disable-line
                            return (//eslint-disable-line
                                <TouchableOpacity
                                    key={result.id}
                                    style={i == nCities - 1 ? [styles.autocompleteTextWrapper, {borderBottomWidth: 1, elevation: 1}] : styles.autocompleteTextWrapper}
                                    onPress={() => this.handleAutocompleteSelect(result.id, result.query)}
                                >
                                    <Text style={styles.autocompleteText}>{result.query}</Text>
                                </TouchableOpacity>
                            );//eslint-disable-line
                        })
                    }
                </ScrollView>
            );
        } else {//eslint-disable-line
            return null;//eslint-disable-line
        }
    }

    renderHotelTopView() {
        return (
            <View style={styles.SearchAndPickerwarp}>
                <View style={styles.searchAreaView}>
                    <SearchBar
                        ref={(searchBar) => this.searchBarRef = searchBar}
                        onTextEnter={this.onSearchEnterKey}
                        autoCorrect={false}
                        value={this.state.search}
                        onChangeText={this.onSearchHandler}
                        placeholder="Discover your next experience"
                        placeholderTextColor="#bdbdbd"
                        leftIcon="search"
                        onLeftPress={this.gotoSearch}
                    />
                </View>
            </View>
        );
    }

    renderHomeTopView() {
        if (__DEV__ && autoHomeSearch) {
            setTimeout(() =>
                this.setState({
                    countryId: 1,
                    countryName: 'Fake Name',
                    value: 100,
                }, () => this.gotoSearch()),
                100
            );
        }
        return (
            //Home
            <View style={styles.SearchAndPickerwarp}>
                <View style={styles.countriesSpinner}>
                    <View style={styles.pickerWrapHomes}>
                        <RNPickerSelect
                            items={this.state.countries}
                            placeholder={{
                                label: 'Choose a location',
                                value: 0
                            }}
                            onValueChange={(value) => {
                                this.setState({
                                    countryId: value.id,
                                    countryName: value.name,
                                    value: value
                                });
                            }}
                            value={this.state.value}
                            style={{ ...pickerSelectStyles }}
                        >
                        </RNPickerSelect>
                    </View>
                </View>
            </View>
        );
    }

    renderHotelSelected() {
        return (
            <View
                style={{ width: '100%', height: '100%', position: 'absolute' }}>
                <Image
                    style={{
                        flex: 1,
                        margin: 20,
                        width: null,
                        height: null,
                        resizeMode: 'contain'
                    }}
                    source={require('../../../assets/home_images/hotels_selected.png')}
                />
            </View>
        )
    }

    renderHotelDeSelected() {
        return (
            <View
                style={{ width: '100%', height: '100%', position: 'absolute' }}>
                <Image
                    style={{
                        flex: 1,
                        margin: 20,
                        width: null,
                        height: null,
                        resizeMode: 'contain'
                    }}
                    source={require('../../../assets/home_images/hotels_not_selected.png')}
                />
            </View>
        )
    }

    renderHomeSelected() {
        return (
            <View
                style={{ width: '100%', height: '100%', position: 'absolute' }}>
                <Image
                    style={{
                        flex: 1,
                        margin: 20,
                        width: null,
                        height: null,
                        resizeMode: 'contain'
                    }}
                    source={require('../../../assets/home_images/homes_selected.png')}
                />
            </View>
        )
    }

    renderHomeDeSelected() {
        return (
            <View
                style={{ width: '100%', height: '100%', position: 'absolute' }}>
                <Image
                    style={{
                        flex: 1,
                        margin: 20,
                        width: null,
                        height: null,
                        resizeMode: 'contain'
                    }}
                    source={require('../../../assets/home_images/homes__not_selected.png')}
                />
            </View>
        )
    }

    renderDateAndGuestsPicker() {
        const {
            checkInDate, checkOutDate, checkInDateFormated, checkOutDateFormated, guests,
            checkInDateMoment, checkOutDateMoment, infants, children, adults
        } = this.state;

        let checkInDatePatched, checkOutDatePatched;

        // if (Platform.OS == 'ios') {
            checkInDatePatched = checkInDateMoment;
            checkOutDatePatched = checkOutDateMoment;
        // } else {
        //     checkInDatePatched = checkInDateFormated;
        //     checkOutDatePatched = checkOutDateFormated;
        // }

        //log('render-date-picker',`[Explore::renderDateAndGuestsPicker] State, checkInDatePatched:${checkInDatePatched}, checkOutDateFormated:${checkOutDateFormated}`,{state:true.state,checkOutDateFormated,checkInDateFormated})

        return (
            <View style={styles.scrollViewContentMain}>
                <DateAndGuestPicker
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    checkInDateFormated={checkInDatePatched}
                    checkOutDateFormated={checkOutDatePatched}
                    adults={adults}
                    children={children}
                    guests={guests}
                    infants={infants}
                    gotoGuests={this.gotoGuests}
                    gotoSearch={this.gotoSearch}
                    onDatesSelect={this.onDatesSelect}
                    gotoSettings={this.gotoSettings}
                    showSearchButton={true}
                    disabled={false}
                    isFilterable={false}
                />
            </View>
        )
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>

                <View style={styles.container}>
                    <Toast
                        ref="toast"
                        style={{ backgroundColor: '#DA7B61' }}
                        position='bottom'
                        positionValue={150}
                        fadeInDuration={500}
                        fadeOutDuration={500}
                        opacity={1.0}
                        textStyle={{ color: 'white', fontFamily: 'FuturaStd-Light' }}
                    />

                    {this.state.isHotel ? this.renderHotelTopView() : this.renderHomeTopView()}
                    {this.renderAutocomplete()}

                    <ScrollView  style={styles.scrollView} automaticallyAdjustContentInsets={true}>

                        { this.renderDateAndGuestsPicker() }

                        <Text style={[styles.scrollViewTitles, { marginBottom: 10, marginTop: 5 }]}>Discover</Text>

                        <View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft:15, marginRight:15 }}>

                                <TouchableOpacity onPress={() => this.setState({ isHotel: true })}
                                    style={[styles.homehotelsView, {marginRight:5}]}>
                                    <Image
                                        style={styles.imageViewHotelsHomes} resizeMode='stretch'
                                        source={require('../../../assets/home_images/hotels.png')} />
                                    {this.state.isHotel ? this.renderHotelSelected() : this.renderHotelDeSelected()}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({
                                    isHotel: false,
                                    cities: [],
                                    search: '',
                                    regionId: 0
                                })}
                                style={[styles.homehotelsView, {marginLeft:5}]}>
                                    <Image style={styles.imageViewHotelsHomes} resizeMode='stretch'
                                        source={require('../../../assets/home_images/homes.png')} />
                                    {!this.state.isHotel ? this.renderHomeSelected() : this.renderHomeDeSelected()}
                                </TouchableOpacity>

                            </View>

                            <Text style={[styles.scrollViewTitles,  { marginBottom: 10, marginTop: 5 }]}>Popular Destinations</Text>

                            <View style={styles.divsider} />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft:15, marginRight:15, marginBottom:10 }}>
                                <TouchableOpacity onPress={() => this.handlePopularCities(52612, 'London , United Kingdom')}
                                    style={styles.subViewPopularHotelsLeft}>
                                    <Image style={styles.imageViewPopularHotels} resizeMode='stretch'
                                        source={require('../../../assets/home_images/london.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.handlePopularCities(18417, 'Madrid , Spain')}
                                    style={styles.subViewPopularHotelsRight}>
                                    <Image style={styles.imageViewPopularHotels} resizeMode='stretch'
                                        source={require('../../../assets/home_images/Madrid.png')} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft:15, marginRight:15, marginBottom:10 }}>

                                <TouchableOpacity onPress={() => this.handlePopularCities(16471, 'Paris , France')}
                                    style={styles.subViewPopularHotelsLeft}>
                                    <Image style={styles.imageViewPopularHotels} resizeMode='stretch'
                                        source={require('../../../assets/home_images/paris.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.handlePopularCities(15375, 'Sydney , Australia')}
                                    style={styles.subViewPopularHotelsRight}>
                                    <Image style={styles.imageViewPopularHotels} resizeMode='stretch'
                                        source={require('../../../assets/home_images/Sydney.png')} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.bottomView}>
                                <Image style={styles.bottomViewText} resizeMode='stretch'
                                    source={require('../../../assets/texthome.png')} />

                                <Image style={styles.bottomViewBanner} resizeMode='stretch'
                                    source={require('../../../../src/assets/vector.png')} />
                            </View>

                        </View>

                    </ScrollView>
                    <LocRateButton onPress={() => this.setState({ currencySelectionVisible: true })}/>

                    <SingleSelectMaterialDialog
                        title = { 'Select Currency' }
                        items = { BASIC_CURRENCY_LIST.map((row, index) => ({ value: index, label: row })) }
                        visible = { this.state.currencySelectionVisible }
                        onCancel = { () =>this.setState({ currencySelectionVisible: false }) }
                        onOk = { result => {
                            //console.log("select country", result);
                            this.setState({ currencySelectionVisible: false });
                            this.props.setCurrency({currency: result.selectedItem.label});
                            // this.props.actions.getCurrency(result.selectedItem.label);
                            // this.setState({ singlePickerSelectedItem: result.selectedItem });
                        }}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        height: 50,
        fontSize: 16,
        paddingTop: 13,
        paddingHorizontal: 10,
        paddingBottom: 12,
        backgroundColor: 'white',
        color: 'black'
    }
});

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        currencySign: state.currency.currencySign,
        countries: state.country.countries,
    };
}

const mapDispatchToProps = dispatch => ({
    setCurrency: bindActionCreators(setCurrency, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Explore);