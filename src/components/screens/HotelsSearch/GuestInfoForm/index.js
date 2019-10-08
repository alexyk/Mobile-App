import React, { Component } from "react";
import { View, Text, KeyboardAvoidingView, ScrollView, Platform } from "react-native";

import PropTypes from "prop-types";
import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { validateName } from "../../../../utils/validation";
import { CurrencyConverter } from "../../../../services/utilities/currencyConverter";
import { RoomsXMLCurrency } from "../../../../services/utilities/roomsXMLCurrency";
import { setLocRateFiatAmount } from "../../../../redux/action/exchangeRates";
import requester from "../../../../initDependencies";
import { userInstance } from "../../../../utils/userInstance";
import { imgHost } from "../../../../config";
import { SC_NAME, DEFAULT_CRYPTO_CURRENCY, OPTIONS } from "../../../../config-settings";
import { processError, clog } from "../../../../utils/debug/debug-tools";
import { gotoWebview } from "../../utils";
import { WebsocketClient } from "../../../../utils/exchangerWebsocket";
import { cloneDeep } from "lodash";

import Image from "react-native-remote-svg";
import GuestFormRow from "./GuestFormRow";
import styles from "./styles";
import Toast from "react-native-easy-toast";
import HotelDetailBottomBar from "../../../atoms/HotelDetailBottomBar";
import BookingSteps from "../../../molecules/BookingSteps";
import Separator from "../../../atoms/Separator";
import StringUtils from "../../../../services/utilities/stringUtilities";
import TopBar from "../../../molecules/TopBar";
import { setGuestData } from "../../../../redux/action/hotels";
import lang from "../../../../language";
import { serverRequest } from "../../../../services/utilities/serverUtils";
import RoomTitle from "./RoomTitle";
import { parseGuestInfoToServerFormat } from "../utils";
import { commonText } from "../../../../common.styles"


const CACHE_REFRESH_TIMEOUT = 0.7; // in seconds

class GuestInfoForm extends Component {
  constructor(props) {
    super(props);

    const { guestData } = props; // retrieved from redux cache
    const { params } = props.navigation.state;
    const { startDateText, endDateText } = props.datesAndGuestsData;

    // Save guests array for dynamic form generation
    this.state = {
      isLoading: true,
      isConfirmed: false,
      isValid: true,
      isDone: false,
      scMode: false,
      proceedButtonLabel: "Loading ...",

      guests: guestData ? cloneDeep(guestData) : null,
      roomType: this._getRoomType(params.roomDetail),
      datesText: lang.TEXT.WAITING_FOR_RESERVATION_CREATION,
      arrivalDate: startDateText,
      leavingDate: endDateText,
      cancelationDate: null,
      creationDate: null,
      cancellationPrice: null,
      bookingId: null,
      reservationRequestData: null,
      reservationRequestData: null,
      reservationData: null,
      invalidGuestNames: []
    };

    this._bookingParams = null;
    this._guestsCollection = [];
    this._editingTimeout;

    this._textRefs = {};
    this._retries = 0;
    this._unMounted = true;

    this._updateStateAndCache = this._updateStateAndCache.bind(this);
    this._serviceRequestSCMode = this._serviceRequestSCMode.bind(this);
    this._prepareInitialGuestsData = this._prepareInitialGuestsData.bind(this);
    this._onGuestTitleUpdate = this._onGuestTitleUpdate.bind(this);
    this._onFirstNameChange = this._onFirstNameChange.bind(this);
    this._onLastNameChange = this._onLastNameChange.bind(this);
    this._onReservationReady = this._onReservationReady.bind(this);
    this._onBackPress = this._onBackPress.bind(this);
    this._onWebviewRightPress = this._onWebviewRightPress.bind(this);
    this._onProceedPress = this._onProceedPress.bind(this);
  }

  componentWillMount() {
    this._prepareInitialGuestsData();
    this._serviceRequestSCMode();
  }
  
  componentDidMount() {
    this._unMounted = false;
    WebsocketClient.stopGrouping();
    this._serviceValidBookingCheck();
  }

  componentWillUnmount() {
    WebsocketClient.startGrouping();
    this._unMounted = true;
  }

  _getRoomType(roomDetail) {
    let roomType = "n/a";
    if (roomDetail && roomDetail.roomsResults && roomDetail.roomsResults.length > 0) {
      try {
        roomType = roomDetail.roomsResults[0].name;
      } catch (error) {
        processError(`[GuestInfoForm] Error trying to get room type - ${error.message}`, { error, roomDetail });
      }
    }

    return roomType;
  }

  async _prepareInitialGuestsData() {
    const { guests } = this.state;
    var preparedGuests = [];

    if (guests != null) {
      this._guestsCollection = cloneDeep(guests); // retrieved from cache in constructor
      this.setState({ isLoading: false });
    } else {
      const { roomsData } = this.props.datesAndGuestsData;

      let userFirstName = await userInstance.getFirstName();
      let userLastName = await userInstance.getLastName();
      const _this = this;

      roomsData.forEach((room, roomIndex) => {
        let { adults, children } = room;
        let currentRoom = [];

        _this._guestsCollection.push(currentRoom);
        preparedGuests.push(currentRoom);

        for (let index = 0; index < adults; index++) {
          let firstName = "";
          let lastName = "";

          if (roomIndex == 0 && index == 0) {
            if (userFirstName != null) firstName = userFirstName;
            if (userLastName != null) lastName = userLastName;
          }

          currentRoom.push({
            key: `${index}`,
            title: "Mr",
            roomIndex,
            firstName,
            lastName
          });
        }

        children.forEach((childAge, index) => {
          currentRoom.push({
            key: `${index}`,
            age: childAge,
            firstName: "",
            lastName: "",
            roomIndex
          });
        });
      });

      _this.setState({ guests: cloneDeep(preparedGuests), isLoading: false });

      if (OPTIONS.hotelReservation.USE_INITIAL_BOOKING) {
        const { quoteId } = _this.props.navigation.state.params.roomDetail;
        const { currency } = _this.props;
        _this.serviceCreateReservation(quoteId, currency, preparedGuests, true);
      }
    }
  }

  _updateStateAndCache() {
    const _this = this;
    const { invalidGuestNames } = this.state;

    this.setState({guests: cloneDeep(this._guestsCollection)});

    if (this._editingTimeout != null) {
      clearTimeout(this._editingTimeout);
    }

    this._editingTimeout = setTimeout(() => {
      if (invalidGuestNames && invalidGuestNames.length > 0) {
        _this._validateAllNames(true);
      }
      _this.props.setGuestData(cloneDeep(_this._guestsCollection));
      clearTimeout(_this._editingTimeout);
      _this._editingTimeout = null;
    }, CACHE_REFRESH_TIMEOUT*1000);
  }
  
  _serviceRequestSCMode() {
    serverRequest(
      this,
      requester.getConfigVarByName,
      [SC_NAME],
      data => {
        this.setState({
          scMode: data.value === "true",
          isLoading: false,
          proceedButtonLabel: "Proceed"
        });
      },
      errorData => {
        //
      }
    );
  }

  _serviceValidBookingCheck() {
    if (!this || this._unMounted) {
      return;
    }

    const { isValid, isDone } = this.state;
    const { quoteId } = this.props.navigation.state.params.roomDetail;

    serverRequest(this, requester.getQuoteIdExpirationFlag,[quoteId],
      data => {
        const { is_quote_valid} = data;
        if (!is_quote_valid) {
          this.setState({isValid: false, proceedButtonLabel: 'Unavailable...'});
        } else if (isValid && !isDone) {
          setTimeout(() => this._serviceValidBookingCheck(), OPTIONS.hotelReservation.VALID_CHECK_INTERVAL);
        }
      },
      (errorData, errorCode) => {
        this.setState({isValid: false, proceedButtonLabel: 'Network Error'});
      }
    );
  }

  _showRoomNAMessage() {
    // this.refs.toast.show(lang.TEXT.ROOM_NA, 3000);
    this.setState({proceedButtonLabel: 'Unavailable...', isValid: false})
  }

  onReservationError(errorData, errorCode) {
    const { errors } = errorData;

    this.setState({proceedButtonLabel: 'Unavailable...', isValid: false})

    if (errors && errors.hasOwnProperty("RoomsXmlResponse")) {
      if (errors["RoomsXmlResponse"].message.indexOf("QuoteNotAvailable:") !== -1) {
        // this.refs.toast.show(errors.RoomsXmlResponse.message, 5000);
      }
    } else if (errors != null) {
      for (let key in errors) {
        if (typeof errors[key] !== "function") {
          // this.refs.toast.show(errors[key].message, 5000);
        }
      }
    }
  }

  onReservationSuccess(data) {
    const { preparedBookingId, booking, fiatPrice } = data || {};

    if (preparedBookingId == null || booking == null ) {
      this._showRoomNAMessage();
      processError(`[GuestInfoForm] [onReservationSuccess] Booking the selected item did not succeed.`, {data});
      return;
    }

    const currentBooking = booking.hotelBooking[0]
    const { createdDate } = booking;
    let { arrivalDate } = currentBooking || {};

    if (arrivalDate == null || currentBooking == null) {
      let max = OPTIONS.hotelReservation.BOOKING_RETRIES;
      if (this._retries <= max) {
        this._retries++;
        clog(`Retrying booking #${this._retries}`, data)
        const { quoteId } = this.props.navigation.state.params.roomDetail;
        const { currency } = this.props;
        this.serviceCreateReservation(quoteId, currency, cloneDeep(this._guestsCollection));
      } else {
        this._showRoomNAMessage();
      }
      return;
    }


    const quoteBookingCandidate = {
      bookingId: preparedBookingId
    };

    // prettier-ignore
    serverRequest(this, requester.quoteBooking, [quoteBookingCandidate],
      success => {
        if (success.is_successful_quoted && (currentBooking != null || arrivalDate != null)) {
          const bookingId = preparedBookingId;
          let startDate, endDate;
          let { checkInMoment, checkOutMoment } = this.props.datesAndGuestsData;
          startDate = (createdDate == null ? checkInMoment.clone() : moment.utc(createdDate));
          endDate = checkOutMoment.clone();

          this.setState({
              bookingId, 
              cancelationDate: endDate.format("DD MMM YYYY"),
              creationDate: startDate.format("DD MMM"),
              cancellationPrice: fiatPrice,
              reservationData: data,
              isLoading: false,
              isConfirmed: true,
              proceedButtonLabel: "Proceed"
            },
            () => {
              const { currencyExchangeRates } = this.props.exchangeRates;
              const fiatPriceRoomsXML = this.props.navigation.state.params.price;
              const fiatPriceRoomsXMLInEur =
                currencyExchangeRates &&
                CurrencyConverter.convert(currencyExchangeRates, RoomsXMLCurrency.get(), DEFAULT_CRYPTO_CURRENCY, fiatPriceRoomsXML);
              this.props.setLocRateFiatAmount(fiatPriceRoomsXMLInEur);
              this._onReservationReady();
            }
          );
        }
      }
    );
  }

  serviceCreateReservation(quoteId, currency, guestRecord, isInitial=false) {
    const reservationRequestData = {
      quoteId, currency,
      rooms: parseGuestInfoToServerFormat(guestRecord, isInitial)
    };
    this.setState({ isLoading: true, proceedButtonLabel: "Processing ...", reservationRequestData });

    let { onReservationSuccess, onReservationError } = this;
    if (isInitial) {
      onReservationSuccess = () => {};
      onReservationError = () => {};
    }
    serverRequest(this, requester.createReservation, [reservationRequestData], onReservationSuccess, onReservationError);
  }

  gotoWebViewPayment() {
    const { searchString } = this.props.navigation.state.params;
    const { quoteId } = this.props.navigation.state.params.roomDetail;
    const { bookingId, reservationRequestData } = this.state;
    const { currency } = this.props;
    const { token, email } = this.props.loginDetails;
    const rooms = JSON.stringify(reservationRequestData.rooms);
    const search = StringUtils.subBeforeIndexOf(searchString, "&rooms=") + `&quoteId=${quoteId}&rooms=${rooms}&authToken=${token}&authEmail=${email}`;
    const state = { currency, token, email };
    const extra = {
      webViewUrl: `mobile/hotels/listings/book/${bookingId}/confirm${search}`,
      message: "Preparing booking payment ...",
      backText: "",
      rightText: "Back To Hotel Details",
      onRightPress: this._onWebviewRightPress
    };
    gotoWebview(state, this.props.navigation, extra);
  }

  _focusFirstInvalidField(firstInvalid, validationState, guestIndex) {
    if (this._needToFocusInvalidAfterProceed && validationState && Object.keys(validationState).length > 0) {
      firstInvalid = guestIndex;
      let isFirstName = (validationState.first != null);
      setTimeout(() => {
        this._textRefs[isFirstName ? guestIndex*2 : guestIndex*2 + 1].focus()
      }, 300)

      this._needToFocusInvalidAfterProceed = false;
    }

    return firstInvalid;
  }

  _validateAllNames(isAutoCheck=false) {
    let result = true;
    const { _textRefs } = this;

    if (_textRefs) {
      let invalidGuestNames = [];

      for (let prop in _textRefs) {
        if (_textRefs[prop] == null) {
          continue;
        }

        let index = parseInt(prop);
        const { _lastNativeText: text } = _textRefs[prop];
        let isFirst = ( (index + 1) % 2 );
        if (!validateName(text)) {
          let no = Math.floor( index / 2 );
          if (invalidGuestNames[no] == null) {
            invalidGuestNames[no] = {};
          }
          if (isFirst) {
            invalidGuestNames[no].first = text;
          } else {
            invalidGuestNames[no].last = text;
          }
        }
      }

      if (!isAutoCheck && invalidGuestNames.length > 0) {
        result = false;
        this.refs.toast.show(`Each name should contain only letters and be two characters or more long.`, 5000);
      }

      this.setState({invalidGuestNames});
    }

    return result;
  }

  _onReservationReady() {
    const { currency } = this.props;
    const { quoteId } = this.props.navigation.state.params.roomDetail;
    const resParams = {
      quoteId,
      currency,
      guestRecord: cloneDeep(this._guestsCollection)
    };
    this.setState({isDone: true});
    this.gotoWebViewPayment(resParams);
  }

  _onWebviewRightPress() {
    this.props.navigation.pop(2);
  }

  _onGuestTitleUpdate(roomIndex, index, title) {
    this._guestsCollection[roomIndex][index].title = title;
    this._updateStateAndCache();
  }

  _onFirstNameChange(roomIndex, key, text) {
    let item = this._guestsCollection[roomIndex];
    item = item[key]
    item.firstName = text;
    this._updateStateAndCache('first-name-changed', roomIndex, key, text);
  }
  
  _onLastNameChange(roomIndex, key, text) {
    let item = this._guestsCollection[roomIndex];
    item = item[key]
    item.lastName = text;
    this._updateStateAndCache('last-name-changed', roomIndex, key, text);
  }

  _onProceedPress() {
    const { isLoading, isValid } = this.state;
    if (isLoading || !isValid) {
      return;
    }
    if (!this._validateAllNames()) {
      this._needToFocusInvalidAfterProceed = true;
      return;
    }

    this.setState({ isLoading: true });

    const { quoteId } = this.props.navigation.state.params.roomDetail;
    const { currency } = this.props;
    this.serviceCreateReservation(quoteId, currency, cloneDeep(this._guestsCollection));
  };

  _onBackPress() {
    this.props.navigation.goBack();
  }

  _renderHotelInfo(params) {
    const { hotelImg, hotelDetails } = params;
    const { name, additionalInfo } = hotelDetails;

    return (
      <View style={styles.hotelInfoContainer}>
        <View style={styles.hotelThumbView}>
          <Image source={{ uri: imgHost + hotelImg }} style={styles.hotelThumb} />
        </View>
        <View style={styles.hotelInfoView}>
          <Text style={styles.hotelName}>{name}</Text>
          <Text style={styles.hotelAddress}>{additionalInfo.mainAddress}</Text>
        </View>
      </View>
    );
  }

  _renderRoomType() {
    return (
      <View style={styles.listItem}>
        <View style={styles.listItemNameWrapper}>
          <Text style={styles.listItemText}>Room Type</Text>
        </View>
        <View style={styles.listItemValueWrapper}>
          <Text style={styles.valueText}>{this.state.roomType}</Text>
        </View>
      </View>
    );
  }

  _renderDates() {
    const { arrivalDate, leavingDate, datesText } = this.state;
    const text = arrivalDate != null && leavingDate != null ? `${arrivalDate} - ${leavingDate}` : datesText;
    return (
      <View style={styles.listItem}>
        <View style={styles.listItemNameWrapper}>
          <Text style={styles.listItemText}>Dates</Text>
        </View>
        <View style={styles.listItemValueWrapper}>
          <Text style={styles.valueText}>{text}</Text>
        </View>
      </View>
    );
  }

  _renderGuestsCount() {
    const { guests } = this.state;
    const { rooms, roomsData } = this.props.datesAndGuestsData;

    if (guests == null) {
      return null;
    }

    return (
      <View>
        { guests.map( (room, roomIndex) => {
            const childrenCount = (roomsData && roomsData[roomIndex] ? roomsData[roomIndex].children.length : 0)
            const guestsCount = room.length - (OPTIONS.guests.SKIP_CHILDREN_NAMES ? childrenCount : 0);
            const extraString = (
              childrenCount > 0 
                ? OPTIONS.guests.SKIP_CHILDREN_NAMES
                  ? <Text style={styles.childCount}>{`\nand ${childrenCount} ${childrenCount == 1 ? 'child' : 'children'}`}</Text>
                  : <Text style={styles.childCount}>{`\nincl. ${childrenCount} ${childrenCount == 1 ? 'child' : 'children'}`}</Text>
                : ""
            );
            return (
              <View key={`${roomIndex}_${guestsCount}`} style={styles.guestsCount}>
                  <Text style={styles.listItemText}>{rooms == 1 ? "Guests" : `Room ${roomIndex+1} Guests`}</Text>
                  <Text style={styles.valueText}>{guestsCount}{extraString}</Text>
              </View>
            )
          })
        }
      </View>
    );
  }

  _renderGuests() {
    const { rooms } = this.props.datesAndGuestsData;
    const { guests, invalidGuestNames } = this.state;

    const _this = this;
    let id = 0;

    let guestsRendered = [];
    let firstInvalid = null;
    let guestIndex = 0;

    if (guests) {
      guests.forEach(
        (room, roomIndex) => {
          // room title
          if (rooms > 1) {
            guestsRendered.push(<RoomTitle key={`title_${roomIndex}`} roomIndex={roomIndex} />)
          }
          // guests in room
          room.forEach((item, index) => {
            const validationState = invalidGuestNames[guestIndex];
            if (firstInvalid == null) {
              firstInvalid = this._focusFirstInvalidField(firstInvalid, validationState, guestIndex);
            }

            guestsRendered.push(
              <GuestFormRow
                id={id}
                key={`${index}_${item.roomIndex}`}
                textRefs={this._textRefs}
                guest={item}
                validationState={validationState}
                guestIndex={index}
                roomIndex={roomIndex}
                onGuestTitleUpdate={_this._onGuestTitleUpdate}
                onFirstNameChange={(index, text) => _this._onFirstNameChange(roomIndex, index, text)}
                onLastNameChange={(index, text) => _this._onLastNameChange(roomIndex, index, text)}
              />
            );

            guestIndex++;

            id += 2;
          })
        }
      )
    }

    return (
      <View>
        {guestsRendered}
      </View>
    );
  }

  render() {
    const { params } = this.props.navigation.state;
    const { price, daysDifference } = params;
    const { proceedButtonLabel, isLoading, isDone, isValid } = this.state;

    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "height" : null} style={styles.container} >
        <Toast
          ref="toast"
          style={{ backgroundColor: "#DA7B61" }}
          position={'center'}
          fadeInDuration={500}
          fadeOutDuration={500}
          opacity={1.0}
          textStyle={{ color: "white", ...commonText }}
        />
        <TopBar onBackPress={this._onBackPress} />
        <Separator height={10} />
        <BookingSteps items={lang.TEXT.BOOKING_STEPS} selectedIndex={0} />
        <Separator height={10} />

        <ScrollView style={styles.content}>
          <Text style={styles.heading}>Provide guest information</Text>
          {this._renderHotelInfo(params)}
          <Separator height={20} />
          {this._renderRoomType()}
          {this._renderDates()}
          {this._renderGuestsCount()}
          <Separator height={10} />
          {this._renderGuests()}
        </ScrollView>

        <HotelDetailBottomBar
          price={price}
          daysDifference={daysDifference}
          titleBtn={proceedButtonLabel}
          onPress={this._onProceedPress}
          isDisabled={isLoading || isDone || !isValid}
        />
      </KeyboardAvoidingView>
    );
  }
}

GuestInfoForm.defaultProps = {
  hotelName: "",
  hotelAddress: "",
  priceInUserCurreny: NaN,
  priceInLoc: NaN,
  quoteId: "",
  roomDetail: {},
  guests: 0,
  guestsArray: []
};

GuestInfoForm.propTypes = {
  hotelName: PropTypes.string,
  hotelAddress: PropTypes.string,
  priceInUserCurreny: PropTypes.number,
  priceInLoc: PropTypes.number,
  quoteId: PropTypes.string,
  roomDetail: PropTypes.object,
  guests: PropTypes.number
};

const mapStateToProps = state => {
  return {
    currency: state.currency.currency,
    currencySign: state.currency.currencySign,

    isLocPriceWebsocketConnected: state.exchangerSocket.isLocPriceWebsocketConnected,
    locAmounts: state.locAmounts,
    exchangeRates: state.exchangeRates,

    loginDetails: state.userInterface.loginDetails,
    guestData: state.hotels.guestData,
    datesAndGuestsData: state.userInterface.datesAndGuestsData
  };
};

const mapDispatchToProps = dispatch => ({
  setLocRateFiatAmount: bindActionCreators(setLocRateFiatAmount, dispatch),
  setGuestData: bindActionCreators(setGuestData, dispatch)
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GuestInfoForm);
