import React, { Component } from "react";
import { View, Text, KeyboardAvoidingView, ScrollView, Platform } from "react-native";

import PropTypes from "prop-types";
import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { hasLetter } from "../../../../utils/validation";
import { CurrencyConverter } from "../../../../services/utilities/currencyConverter";
import { RoomsXMLCurrency } from "../../../../services/utilities/roomsXMLCurrency";
import { setLocRateFiatAmount } from "../../../../redux/action/exchangeRates";
import requester from "../../../../initDependencies";
import { userInstance } from "../../../../utils/userInstance";
import { imgHost } from "../../../../config";
import { SC_NAME, DEFAULT_CRYPTO_CURRENCY } from "../../../../config-settings";
import { processError, rlog, clog } from "../../../../utils/debug/debug-tools";
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
      scMode: false,
      buttonLabel: "Loading ...",

      guests: guestData ? cloneDeep(guestData) : null,
      roomType: this._getRoomType(params.roomDetail),
      datesText: lang.TEXT.WAITING_FOR_RESERVATION_CREATION,
      arrivalDate: startDateText,
      leavingDate: endDateText,
      cancelationDate: null,
      creationDate: null,
      cancellationPrice: null,
      bookingId: null,
      hotelBooking: null,
      booking: null,
      data: null
    };

    this._bookingParams = null;
    this._guestsCollection = [];
    this._editingTimeout;

    this._updateCache = this._updateCache.bind(this);
    this._serviceRequestSCMode = this._serviceRequestSCMode.bind(this);
    this._prepareInitialGuestsData = this._prepareInitialGuestsData.bind(this);
    this._onGuestTitleUpdate = this._onGuestTitleUpdate.bind(this);
    this._onFirstNameChange = this._onFirstNameChange.bind(this);
    this._onLastNameChange = this._onLastNameChange.bind(this);
    this._onReservationReady = this._onReservationReady.bind(this);
    this._onBackPress = this._onBackPress.bind(this);
    this._onWebviewRightPress = this._onWebviewRightPress.bind(this);
  }

  componentWillMount() {
    this._prepareInitialGuestsData();
    this._serviceRequestSCMode();
  }

  componentDidMount() {
    WebsocketClient.stopGrouping();
  }

  componentWillUnmount() {
    WebsocketClient.startGrouping();
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
    }
  }

  _updateCache() {
    const _this = this;

    if (this._editingTimeout != null) {
      clearTimeout(this._editingTimeout);
    }

    this._editingTimeout = setTimeout(() => {
      _this.props.setGuestData(cloneDeep(_this._guestsCollection), 700)
      clearTimeout(_this._editingTimeout);
      _this._editingTimeout = null;
    });
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
          buttonLabel: "Proceed"
        });
      },
      errorData => {
        //
      }
    );
  }

  onReservationError(errorData, errorCode) {
    const { errors } = errorData;

    if (errors.hasOwnProperty("RoomsXmlResponse")) {
      if (errors["RoomsXmlResponse"].message.indexOf("QuoteNotAvailable:") !== -1) {
        this.refs.toast.show(data.errors.RoomsXmlResponse.message, 5000, () => {
          this.props.navigation.pop(3);
        });
      }
    } else {
      for (let key in errors) {
        if (typeof errors[key] !== "function") {
          this.refs.toast.show(errors[key].message, 5000, () => {
            this.props.navigation.pop(3);
          });
        }
      }
    }
  }

  onReservationSuccess(data) {
    //rlog('case 2')
    // console.log("createReservation  ---", data)
    const quoteBookingCandidate = {
      bookingId: data.preparedBookingId
    };

    serverRequest(
      this,
      requester.quoteBooking,
      [quoteBookingCandidate],
      success => {
        if (success.is_successful_quoted) {
          const bookingId = data.preparedBookingId;
          const hotelBooking = data.booking.hotelBooking[0];
          const startDate = moment(data.booking.hotelBooking[0].creationDate, "YYYY-MM-DD");
          const endDate = moment(data.booking.hotelBooking[0].arrivalDate, "YYYY-MM-DD");
          const leavingDate = moment(data.booking.hotelBooking[0].arrivalDate, "YYYY-MM-DD").add(data.booking.hotelBooking[0].nights, "days");
          this.setState(
            {
              roomType: data.booking.hotelBooking[0].room.roomType.text,
              //arrivalDate: endDate.format('DD MMM'),
              //leavingDate: leavingDate.format('DD MMM'),
              cancelationDate: endDate.format("DD MMM YYYY"),
              creationDate: startDate.format("DD MMM"),
              cancellationPrice: data.fiatPrice,
              bookingId: bookingId,
              hotelBooking: hotelBooking,
              booking: value,
              data,
              isLoading: false,
              isConfirmed: true,
              buttonLabel: "Proceed"
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
          //rlog('case 4')
        } else {
          this.props.navigation.navigation.pop(3);
          //rlog('case 5')
        }
      },
      () => {}
    );
  }

  serviceCreateReservation(quoteId, currency, guestRecord) {
    const value = {
      quoteId,
      currency,
      rooms: [
        {
          adults: guestRecord,
          children: []
        }
      ]
    };
    this.setState({ isLoading: true, buttonLabel: "Processing ..." });

    serverRequest(this, requester.createReservation, [value], this.onReservationSuccess, this.onReservationError);
  }

  gotoWebViewPayment() {
    const { searchString } = this.props.navigation.state.params;
    const { quoteId } = this.props.navigation.state.params.roomDetail;
    const { quoteId: quoteId2 } = this.props;
    const { bookingId, booking } = this.state;
    const { currency } = this.props;
    const { token, email } = this.props.loginDetails;
    const rooms = JSON.stringify(booking.rooms);
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

  _onReservationReady() {
    const { currency } = this.props;
    const { quoteId } = this.props.navigation.state.params.roomDetail;
    const resParams = {
      quoteId,
      currency,
      guestRecord: cloneDeep(this._guestsCollection)
    };
    this.gotoWebViewPayment(resParams);
  }

  _onWebviewRightPress() {
    this.props.navigation.pop(2);
  }

  _onGuestTitleUpdate(roomIndex, index, title) {
    this._guestsCollection[index].title = title;
    this.props.setGuestData(cloneDeep(this._guestsCollection));
  }

  _onFirstNameChange(roomIndex, key, text) {
    let item = this._guestsCollection[roomIndex];
    item = item[parseInt(key)]
    item.firstName = text; // (text === "" ? "Optional" : text)
    this._updateCache();
  }
  
  _onLastNameChange(roomIndex, key, text) {
    this._guestsCollection[roomIndex][parseInt(key)].lastName = text; // (text === "" ? "Optional" : text)
    this._updateCache();
  }

  onProceedPress = () => {
    if (this.state.isLoading) {
      return;
    }
    let isValid = true;
    this.setState({ isLoading: true });

    for (let item of this._guestsCollection) {
      if (!hasLetter(item["firstName"]) || !hasLetter(item["lastName"])) {
        isValid = false;
        break;
      }
    }

    if (this._guestsCollection.length != this.state.guests.length) {
      this.refs.toast.show("Please enter details for all the guests", 2000);
    } else if (!isValid) {
      this.refs.toast.show("Names should be at least 1 characters long and contain only characters.", 2000);
    } else {
      const { quoteId } = this.props.navigation.state.params.roomDetail;
      const { currency } = this.props;
      this.serviceCreateReservation(quoteId, currency, cloneDeep(this._guestsCollection));
    }
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

  _renderGuestsCount(guestsCount) {
    return (
      <View style={styles.listItem}>
        <View style={styles.listItemNameWrapper}>
          <Text style={styles.listItemText}>Guests</Text>
        </View>
        <View style={styles.listItemValueWrapper}>
          <Text style={styles.valueText}>{guestsCount}</Text>
        </View>
      </View>
    );
  }

  _renderGuests() {
    const _this = this;
    let guestsRendered = [];

    if (this.state.guests) {
      this.state.guests.forEach(
        (room, roomIndex) => (
          room.forEach((item, index) => {
            clog({item,index,roomIndex,room})
            guestsRendered.push(
              <GuestFormRow
                key={`${index}_${item.roomIndex}`}
                guest={item}
                itemIndex={index}
                roomIndex={roomIndex}
                onGuestTitleUpdate={_this._onGuestTitleUpdate}
                onFirstNameChange={(index, text) => _this._onFirstNameChange(roomIndex, index, text)}
                onLastNameChange={(index, text) => _this._onLastNameChange(roomIndex, index, text)}
              />
            )
          })
        )
      )
    }


    return (
      <View style={{ backgroundColor: "#f0f1f3" }}>
        {guestsRendered}
      </View>
    );
  }

  render() {
    const { params } = this.props.navigation.state;
    const { price, daysDifference, guests: guestsCount } = params;
    const { buttonLabel, isLoading } = this.state;

    return (
      <View style={styles.container}>
        <Toast
          ref="toast"
          style={{ backgroundColor: "#DA7B61" }}
          position="bottom"
          positionValue={150}
          fadeInDuration={500}
          fadeOutDuration={500}
          opacity={1.0}
          textStyle={{ color: "white", fontFamily: "FuturaStd-Light" }}
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
          {this._renderGuestsCount(guestsCount)}
          <Separator height={10} />
          <KeyboardAvoidingView behavior="position" enabled>
            {this._renderGuests()}
          </KeyboardAvoidingView>
        </ScrollView>

        <HotelDetailBottomBar
          price={price}
          daysDifference={daysDifference}
          titleBtn={buttonLabel}
          onPress={this.onProceedPress}
          isDisabled={isLoading}
        />
      </View>
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
