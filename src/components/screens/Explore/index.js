import React, { Component } from "react";
import { AsyncStorage, Image, Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import Toast from "react-native-easy-toast"; //eslint-disable-line
import RNPickerSelect from "react-native-picker-select"; //eslint-disable-line
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { NavigationActions, StackActions } from "react-navigation";
import { cloneDeep } from 'lodash';
import { domainPrefix } from "../../../config";
import { autoHomeSearch, autoHotelSearch, autoHotelSearchFocus, autoHotelSearchPlace, isOnline, testFlow } from "../../../config-debug";
import { testFlowExec, processError, ilog, tslog } from "../../../utils/debug/debug-tools";
import requester from "../../../initDependencies";
import lang from "../../../language";
import { setCurrency } from "../../../redux/action/Currency";
import { setDatesAndGuestsData } from "../../../redux/action/userInterface";
import { userInstance } from "../../../utils/userInstance";
import LocRateButton from "../../atoms/LocRateButton";
import SingleSelectMaterialDialog from "../../atoms/MaterialDialog/SingleSelectMaterialDialog";
import SearchBar from "../../molecules/SearchBar";
import DateAndGuestPicker from "../../organisms/DateAndGuestPicker";
import { gotoWebview, stringifyRoomsData, processGuestsData } from "../utils";
import styles from "./styles";
import { formatDatesData } from "../Calendar/utils";
import { hotelSearchIsNative, BASIC_CURRENCY_LIST } from "../../../config-settings";
import { setLoginDetails } from "../../../redux/action/userInterface";
import { getSafeTopOffset } from "../../../utils/designUtils";
import { serverRequest } from "../../../services/utilities/serverUtils";
import { setGuestData } from "../../../redux/action/hotels";
import { isString, isNumber, getObjectFromPath, isArray } from "js-tools";
import MessageDialog from "../../molecules/MessageDialog";
import { SettingsContent } from "../Settings/components";



class Explore extends Component {
  static self;

  constructor(props) {
    super(props);

    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.updateData = this.updateData.bind(this);
    this.gotoGuests = this.gotoGuests.bind(this);
    this.gotoSearch = this.gotoSearch.bind(this);
    this.gotoSettings = this.gotoSettings.bind(this);
    this.renderAutocomplete = this.renderAutocomplete.bind(this);
    this.handleAutocompleteSelect = this.handleAutocompleteSelect.bind(this);
    this.handlePopularCities = this.handlePopularCities.bind(this);
    this.onDatesSelect = this.onDatesSelect.bind(this);
    this.onSearchHandler = this.onSearchHandler.bind(this);
    this.onSearchEnterKey = this.onSearchEnterKey.bind(this);

    this.state = {
      isHotel: true,
      countryId: 0,
      countryName: "",
      value: "",
      countries: [],
      cities: [],
      search: "",
      regionId: "",
      daysDifference: 1,
      roomsDummyData: props.datesAndGuestsData.roomsDummyData,
      filter: {
        showUnavailable: true,
        name: "",
        minPrice: 1,
        maxPrice: 5000,
        stars: [0, 1, 2, 3, 4, 5]
      },
      count: {
        beds: 2,
        bedrooms: 0,
        bathrooms: 0
      },
      currency: props.currency, //eslint-disable-line
      currencySign: props.currencySign, //eslint-disable-line
      email: "",
      token: "",
      countriesLoaded: false,
      currencySelectionVisible: false,
      ...props.datesAndGuestsData
    };

    // this.props.actions.getCurrency(props.currency, false);//eslint-disable-line
  }

  onServerGetUserInfo(data) {
    //  with redux cache, for example:
    this.props.setLoginDetails(data);

    const { countryState, country } = data;
    
    if (countryState) {
      serverRequest(this, requester.getStates, [country.id],
        (data) => {
          if (isNumber(getObjectFromPath(countryState, "id"))) {
            const selected = data.filter(item => item.id == countryState.id);
            
            if (isArray(selected) && selected.length == 1) {
              this.props.setLoginDetails({countryState: cloneDeep(selected[0])});
            }
          }
          
          this.processStates(data, {countryState, lastCountry: country});
        }
      );
    }

    const { email } = data;

    if (email) {
      // TODO: Remove all AsyncStorage calls
      AsyncStorage.setItem(`${domainPrefix}.auth.username`, email);
      this.setState({ email });
    }

    // TODO: Replace all references to user data (async storage)
    userInstance.setUserData(data);
  }

  onServerGetUserInfoError(errorData, errorCode) {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Welcome' })],
    });
    this.props.navigation.dispatch(resetAction);
    MessageDialog.showMessage(this, "Login Expired",`Last login is not valid any more.\nPlease log in again.`, 'login-expired');
  }

  async componentWillMount() {
    const token_value = await AsyncStorage.getItem(`${domainPrefix}.auth.locktrip`);
    const email_value = await AsyncStorage.getItem(`${domainPrefix}.auth.username`);
    const newState = { token: token_value, email: email_value };
    this.setState(newState);
    this.props.setDatesAndGuestsData({
      onConfirm: this.onDatesSelect,
      ...newState
    });

    if (__DEV__) {
      if (autoHotelSearchFocus) this.searchBarRef.focus();
    }

    // TODO: An old note below. To fix - investigate the commit by abhi when it was added:
    // Below line gives null cannot be casted to string error on ios please look into it

    // prettier-ignore
    serverRequest( this, requester.getUserInfo, [],
      this.onServerGetUserInfo,
      this.onServerGetUserInfoError
    );

    // TODO: Also there was a merge about 10 months ago - see yuri930 commit for the above code (where the issue is)
    // Best - get rid of AsyncStorage and use redux to clear any cache issues
    this.setCountriesInfo();
  }

  async componentDidMount() {
    console.disableYellowBox = true;
    // prettier-ignore
    if (__DEV__ && testFlow) {
      // run a test flow - for easy debug/development/testing
      testFlowExec(testFlow, {reduxAction: this.props.setDatesAndGuestsData});
      return;
    } else if (__DEV__ && autoHotelSearch) {
      // enable automatic search
      setTimeout(() => {
        this.onSearchHandler(autoHotelSearchPlace);
      }, 100);
      if (!isOnline) {
        setTimeout(() => this.gotoSearch(), 300);
      }
    }
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    const { countries, currency, currencySign } = this.props;

    if (currency != prevProps.currency) {
      this.setState({ currency: currency, currencySign: currencySign });
    }

    if (countries != prevProps.countries) {
      this.setCountriesInfo();
    }

    if (__DEV__ && autoHotelSearchFocus && this.searchBarRef) {
      this.searchBarRef.focus();
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
    return value => {
      this.setState({ [property]: value });
    };
  }

  onDatesSelect(inputData) {
    try {
      const { checkInMoment, checkOutMoment, inputFormat, today } = inputData;
      const daysDifference = checkOutMoment.diff(checkInMoment, "days");
      const formattedDates = formatDatesData(today.year(), checkInMoment, checkOutMoment, inputFormat);
      const newState = { ...formattedDates, daysDifference };
      const newCache = { ...inputData, ...formattedDates };

      ilog(`[explore] onDateSelect`, {
        newState,
        newCache,
        inputData,
        formattedDates
      });

      // detach from current code execution - for smooth transition of screens
      setTimeout(() => this.setState(newState));
      setTimeout(() => this.props.setDatesAndGuestsData(newCache));
    } catch (error) {
      processError(`[Explore::onDateSelect] Error while setting date: ${error.message}`, { error });
    }
  }

  onSearchEnterKey(event) {
    // auto search on enter (done) key from keyboard
    if (__DEV__ && this.state.cities.length > 0) {
      const { id, query } = this.state.cities[0];
      this.handleAutocompleteSelect(id, query, this.gotoSearch);
    }
  }

  onSearchHandler(value) {
    this.setState({ search: value });
    if (value === "") {
      this.setState({ cities: [] });
    } else {
      // prettier-ignore
      serverRequest(this, requester.getRegionsBySearchParameter, [[`query=${value}`]],
        data => {
          if (this.state.search != "") {
            this.setState({ cities: data }, () => {
              // enable automatic search
              if (__DEV__ && autoHotelSearch) {
                setTimeout(() => {
                  const { id, query } = data[0];
                  //logd('citites','citites',{data,id,query})
                  this.handlePopularCities(id, query);
                  setTimeout(() => this.gotoSearch(), 100);
                }, 500);
              }
            });
          }
        }
      )
    }
  }

  onValueChange = value => {
    //console.log(value);
    //console.log(this.state.loc);
  };

  updateData(data) {
    const { adults, children, childrenAgeValues, rooms } = data;

    let roomsData = processGuestsData(adults, rooms, childrenAgeValues);
    let roomsDummyData = stringifyRoomsData(roomsData);

    const newState = {
      adults,
      children,
      childrenAgeValues,
      rooms,
      roomsData,
      roomsDummyData,
      guests: adults + children
    };
    this.setState(newState);
    this.props.setDatesAndGuestsData(newState);
    this.props.setGuestData(null);
  }

  gotoGuests() {
    this.props.navigation.navigate("GuestsScreen", {
      updateData: this.updateData
    });
  }

  gotoSettings() {
    MessageDialog.show(this, 'Settings', <SettingsContent />, 'settings');
  }

  _cacheLoginAndRegion() {
    const { token, email, isHotel, search } = this.state;
    // prettier-ignore
    const extraParams = {
      isHotel,
      token: token,
      email: email,
      message: isHotel
        ? `Looking for hotels in\n"${search}"`
        : `Looking for homes in\n"${search}"`,
      title: isHotel
        ? lang.TEXT.SEARCH_HOTEL_RESULTS_TILE
        : lang.TEXT.SEARCH_HOME_RESULTS_TILE
    };

    //TODO: When refactoring - create and move to a clean login flow
    // (the place is not here for sure, but somewhere in AppLoading for example)
    this.props.setLoginDetails({ token, email });
    this.props.setDatesAndGuestsData({ regionId: this.state.regionId });

    return extraParams;
  }

  gotoSearch() {
    tslog('search flow step 1 - from search touch/click to static data');
    if (__DEV__ && testFlow) {
      testFlowExec(testFlow, {reduxAction: this.props.setDatesAndGuestsData});
      return;
    }

    const delayedFunction = () => {
      const extraParams = this._cacheLoginAndRegion();
      console.log(`#hotel-search# 1/5 gotoSearch, ${this.state.checkOutDateFormated}, ${this.state.checkInDateFormated}`, { extraParams });

      if (hotelSearchIsNative.step1Results) {
        const {
          token,
          email,
          isHotel,
          search,
          regionId,
          oneHotelId,
          roomsDummyData,
          daysDifference,
          adults,
          guests,
          children,
          checkInDate,
          checkOutDate,
          checkInDateFormated,
          checkOutDateFormated
        } = this.state;

        if (isHotel) {
          // TODO: Cache these to redux and re-use

          if (regionId === "" || regionId === 0) {
            this.refs.toast.show("Please input location to search hotels.", 2500);
            return;
          }

          this.props.navigation.navigate("HotelsSearchScreen", {
            isHotel: isHotel,
            searchedCity: search,
            regionId, oneHotelId,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            guests: guests,
            adults: adults,
            children: children,
            checkInDateFormated: checkInDateFormated,
            checkOutDateFormated: checkOutDateFormated,
            roomsDummyData: roomsDummyData, //encodeURI(JSON.stringify(this.state.roomsData)),
            daysDifference: daysDifference,
            token: token,
            email: email
          });
        } else {
          //console.log("this.state.value.", this.state.value);
          if (this.state.value === "" || this.state.value === 0) {
            this.refs.toast.show("Please select country to book home.", 2500);
            return;
          }
          this.props.navigation.navigate("HomesSearchScreen", {
            countryId: this.state.countryId,
            home: this.state.value,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            guests: guests,
            adults: adults,
            children: children,
            checkOutDateFormated: checkOutDateFormated,
            checkInDateFormated: checkInDateFormated,
            roomsDummyData: roomsDummyData, //encodeURI(JSON.stringify(this.state.roomsData)),
            daysDifference: daysDifference
          });
        }
      } else {
        if (this.state.isHotel && this.state.regionId == "") {
          //Empty location
          this.refs.toast.show("Please input location to search hotels.", 2500);
          this.setState({ search: "" });
        } else if (!this.state.isHotel && this.state.value === "") {
          this.refs.toast.show("Please select country to book home.", 2500);
          return;
        } else {
          const { props, state } = this;
          gotoWebview(state, props.navigation, extraParams);
        }
      }
    };

    // leave execution time for animation and search button release
    setTimeout(delayedFunction, 100);
  }

  /**
   * @param {String|Number} id Region id
   * @param {String} name Search name - for example "London, United Kingdom"
   * @param {Function} callback If set - the callback executes after setting the state with parameter values
   */
  handleAutocompleteSelect(id, name, callback = null) {
    let oneHotelId = null;
    if (isString(id) && id.includes('_')) {
      let asArray = id.split('_');
      id = parseInt(asArray[0]);
      oneHotelId = parseInt(asArray[1]);
    }
    this.setState(
      {
        oneHotelId,
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
            position: "absolute",
            top: getSafeTopOffset() + 35,
            marginLeft: 15,
            marginRight: 15,
            minHeight: 100,
            zIndex: 99
          }}
        >
          {this.state.cities.map((result, i) => {
            //eslint-disable-line
            return (
              //eslint-disable-line
              <TouchableOpacity
                key={result.id}
                style={i == nCities - 1 ? [styles.autocompleteTextWrapper, { borderBottomWidth: 1, elevation: 1 }] : styles.autocompleteTextWrapper}
                onPress={() => this.handleAutocompleteSelect(result.id, result.query)}
              >
                <Text style={styles.autocompleteText}>{result.query}</Text>
              </TouchableOpacity>
            ); //eslint-disable-line
          })}
        </ScrollView>
      );
    } else {
      //eslint-disable-line
      return null; //eslint-disable-line
    }
  }

  renderHotelTopView() {
    return (
      <View style={styles.SearchAndPickerwarp}>
        <View style={styles.searchAreaView}>
          <SearchBar
            ref={searchBar => (this.searchBarRef = searchBar)}
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
      setTimeout(
        () =>
          this.setState(
            {
              countryId: 1,
              countryName: "Fake Name",
              value: 100
            },
            () => this.gotoSearch()
          ),
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
                label: "Choose a location",
                value: 0
              }}
              onValueChange={value => {
                this.setState({
                  countryId: value.id,
                  countryName: value.name,
                  value: value
                });
              }}
              value={this.state.value}
              style={{ ...pickerSelectStyles }}
            ></RNPickerSelect>
          </View>
        </View>
      </View>
    );
  }

  renderHotelSelected() {
    return (
      <View style={{ width: "100%", height: "100%", position: "absolute" }}>
        <Image
          style={{
            flex: 1,
            margin: 20,
            width: null,
            height: null,
            resizeMode: "contain"
          }}
          source={require("../../../assets/home_images/hotels_selected.png")}
        />
      </View>
    );
  }

  renderHotelDeSelected() {
    return (
      <View style={{ width: "100%", height: "100%", position: "absolute" }}>
        <Image
          style={{
            flex: 1,
            margin: 20,
            width: null,
            height: null,
            resizeMode: "contain"
          }}
          source={require("../../../assets/home_images/hotels_not_selected.png")}
        />
      </View>
    );
  }

  renderHomeSelected() {
    return (
      <View style={{ width: "100%", height: "100%", position: "absolute" }}>
        <Image
          style={{
            flex: 1,
            margin: 20,
            width: null,
            height: null,
            resizeMode: "contain"
          }}
          source={require("../../../assets/home_images/homes_selected.png")}
        />
      </View>
    );
  }

  renderHomeDeSelected() {
    return (
      <View style={{ width: "100%", height: "100%", position: "absolute" }}>
        <Image
          style={{
            flex: 1,
            margin: 20,
            width: null,
            height: null,
            resizeMode: "contain"
          }}
          source={require("../../../assets/home_images/homes__not_selected.png")}
        />
      </View>
    );
  }

  renderDateAndGuestsPicker() {
    const { guests, children, adults, startDateText, endDateText } = this.props.datesAndGuestsData;

    return (
      <View style={styles.scrollViewContentMain}>
        <DateAndGuestPicker
          checkInDate={startDateText}
          checkOutDate={endDateText}
          adults={adults}
          children={children}
          guests={guests}
          gotoGuests={this.gotoGuests}
          gotoSearch={this.gotoSearch}
          onDatesSelect={this.onDatesSelect}
          gotoOptions={this.gotoSettings}
          showSearchButton={true}
          disabled={false}
          containerStyle={{ paddingTop: 0 }}
        />
      </View>
    );
  }

  renderMessageDialog() {
    const { messageTitle, dialogContent, dialogMessage, messageVisible } = this.state;

    return (
      <MessageDialog
        parent={this}
        isVisible={messageVisible} 
        title={messageTitle}
        message={dialogMessage}
        content={dialogContent}
      />
    )
  }

  render() {
    // prettier-ignore
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f1f3" />
        <Toast
          ref="toast"
          style={{ backgroundColor: "#DA7B61" }}
          position="top"
          positionValue={300}
          fadeInDuration={500}
          fadeOutDuration={500}
          opacity={1.0}
          textStyle={{ color: "white", fontFamily: "FuturaStd-Light" }}
        />

        {this.state.isHotel ? this.renderHotelTopView() : this.renderHomeTopView()}
        {this.renderAutocomplete()}

        <ScrollView style={styles.scrollView} automaticallyAdjustContentInsets={true}>
          {this.renderDateAndGuestsPicker()}

          <Text style={[styles.scrollViewTitles, { marginBottom: 10, marginTop: 5 }]}>Discover</Text>

          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginLeft: 15,
                marginRight: 15
              }}
            >
              <TouchableOpacity
                onPress={() => this.setState({ isHotel: true })}
                style={[styles.homehotelsView, { marginRight: 5 }]}
              >
                <Image
                  style={styles.imageViewHotelsHomes}
                  resizeMode="stretch"
                  source={require("../../../assets/home_images/hotels.png")}
                />
                {this.state.isHotel
                  ? this.renderHotelSelected()
                  : this.renderHotelDeSelected()}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  this.setState({
                    isHotel: false,
                    cities: [],
                    search: "",
                    regionId: 0
                  })
                }
                style={[styles.homehotelsView, { marginLeft: 5 }]}
              >
                <Image
                  style={styles.imageViewHotelsHomes}
                  resizeMode="stretch"
                  source={require("../../../assets/home_images/homes.png")}
                />
                {!this.state.isHotel
                  ? this.renderHomeSelected()
                  : this.renderHomeDeSelected()}
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.scrollViewTitles,
                { marginBottom: 10, marginTop: 5 }
              ]}
            >
              Popular Destinations
            </Text>

            <View style={styles.divsider} />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginLeft: 15,
                marginRight: 15,
                marginBottom: 10
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  this.handlePopularCities(24979, "London , United Kingdom")
                }
                style={styles.subViewPopularHotelsLeft}
              >
                <Image
                  style={styles.imageViewPopularHotels}
                  resizeMode="stretch"
                  source={require("../../../assets/home_images/london.png")}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  this.handlePopularCities(17120, "Madrid , Spain")
                }
                style={styles.subViewPopularHotelsRight}
              >
                <Image
                  style={styles.imageViewPopularHotels}
                  resizeMode="stretch"
                  source={require("../../../assets/home_images/Madrid.png")}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginLeft: 15,
                marginRight: 15,
                marginBottom: 10
              }}
            >
              <TouchableOpacity
                onPress={() => this.handlePopularCities(5290, "Paris , France")}
                style={styles.subViewPopularHotelsLeft}
              >
                <Image
                  style={styles.imageViewPopularHotels}
                  resizeMode="stretch"
                  source={require("../../../assets/home_images/paris.png")}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  this.handlePopularCities(602, "Sydney , Australia")
                }
                style={styles.subViewPopularHotelsRight}
              >
                <Image
                  style={styles.imageViewPopularHotels}
                  resizeMode="stretch"
                  source={require("../../../assets/home_images/Sydney.png")}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomView}>
              <Image
                style={styles.bottomViewText}
                resizeMode="stretch"
                source={require("../../../assets/texthome.png")}
              />

              <Image
                style={styles.bottomViewBanner}
                resizeMode="stretch"
                source={require("../../../../src/assets/vector.png")}
              />
            </View>
          </View>
        </ScrollView>
        <LocRateButton
          onPress={() => this.setState({ currencySelectionVisible: true })}
        />

        <SingleSelectMaterialDialog
          title={"Select Currency"}
          items={BASIC_CURRENCY_LIST.map((row, index) => ({
            value: index,
            label: row
          }))}
          visible={this.state.currencySelectionVisible}
          selected={this.props.currency}
          onCancel={() => this.setState({ currencySelectionVisible: false })}
          onOk={result => {
            this.setState({ currencySelectionVisible: false });
            this.props.setCurrency({ currency: result.selectedItem.label });

            // this.props.actions.getCurrency(result.selectedItem.label);
            // this.setState({ singlePickerSelectedItem: result.selectedItem });
          }}
        />

        { this.renderMessageDialog() }
      </View>
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
    backgroundColor: "white",
    color: "black"
  }
});

let mapStateToProps = state => {
  return {
    currency: state.currency.currency,
    currencySign: state.currency.currencySign,
    countries: state.country.countries,
    datesAndGuestsData: state.userInterface.datesAndGuestsData
  };
};

const mapDispatchToProps = dispatch => ({
  setCurrency: bindActionCreators(setCurrency, dispatch),
  setLoginDetails: bindActionCreators(setLoginDetails, dispatch),
  setDatesAndGuestsData: bindActionCreators(setDatesAndGuestsData, dispatch),
  setGuestData: bindActionCreators(setGuestData, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Explore);
