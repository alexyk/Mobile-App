import { StatusBar, ScrollView, View, TouchableOpacity } from "react-native";
import React, { Component } from "react";
import PropTypes from "prop-types";
import AvailableRoomsView from "../../../molecules/AvailableRoomsView";
import FacilitiesView from "../../../molecules/FacilitiesView";
import HotelDetailView from "../../../organisms/HotelDetailView";
import LocationView from "../../../atoms/LocationView";
import BackButton from "../../../atoms/BackButton";
import styles from "./styles";
import { connect } from "react-redux";
import { hotelSearchIsNative, OPTIONS } from "../../../../config-settings";
import { SCREEN_SIZE } from "../../../../utils/designUtils";
import Toast from "react-native-easy-toast";
import ImageSlides from "../../../molecules/ImageSlides";
import { serverRequest } from "../../../../services/utilities/serverUtils";
import requester from "../../../../initDependencies";
import { commonText } from "../../../../common.styles";
import lang from "../../../../language";
import MessageDialog from "../../../molecules/MessageDialog";
import { skipEmailVerification } from "../../../../config-debug";


class HotelDetails extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func
    })
  };

  static defaultProps = {
    navigation: {
      navigate: () => {}
    }
  };

  constructor(props) {
    super(props);

    const { params } = this.props.navigation.state;
    const { searchString } = props;
    const { guests } = props.datesAndGuestsData;

    this.state = {
      hotel: params ? params.hotelDetail : [],
      hotelFullDetails: params ? params.hotelFullDetails : [],
      hotelAmenities: params ? params.hotelFullDetails.hotelAmenities : [],
      mainAddress: params
        ? params.hotelFullDetails.additionalInfo.mainAddress
        : "",
      dataSourcePreview: params ? params.dataSourcePreview : [],
      regionName: params ? params.hotelFullDetails.city : "",
      countryName: params ? params.hotelFullDetails.country : "",
      description: params ? params.hotelFullDetails.generalDescription : "",
      latitude: params ? params.hotelFullDetails.latitude : 0.0,
      longitude: params ? params.hotelFullDetails.longitude : 0.0,
      hotelRatingStars: params ? params.hotelDetail.stars : 0,
      daysDifference: params ? params.daysDifference : 1,
      canLoadLocation: false,
      guests,
      searchString,
      currentIndex: 0,
    };

    this._isMounted = false;

    this.onClose = this.onClose.bind(this);
    this.onTryBooking = this.onTryBooking.bind(this);
    this.onUserInfoSuccessAndBook = this.onUserInfoSuccessAndBook.bind(this);
    this.onUserInfoError = this.onUserInfoError.bind(this);
    this.onFacilityMore = this.onFacilityMore.bind(this);
    this.onBackButtonPress = this.onBackButtonPress.bind(this);
    this.onSendVerificationEmail = this.onSendVerificationEmail.bind(this);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  

  componentDidMount() {
    this._isMounted = true;
    // Temporary solution - improve loading time by delaying location
    // TODO: Improve suggestion - provide an image (screenshot of map) rather than a map component
    setTimeout(() => {
      if (this && !this._isMounted) {
        this.setState({ canLoadLocation: true })
      }
    }, 3000);
  }

  onBackButtonPress() {
    this.props.navigation.goBack();
  }

  onMapTap() {
    this.props.navigation.navigate("MapFullScreen", {
      lat: this.state.latitude != null ? parseFloat(this.state.latitude) : 0.0,
      lng:
        this.state.longitude != null ? parseFloat(this.state.longitude) : 0.0,
      name: this.state.hotel.name,
      address: `${this.state.mainAddress}, ${this.state.countryName}`
    });
  }

  onClose() {
    this.props.navigation.goBack();
  }

  onFacilityMore() {}

  onTryBooking(roomDetail) {
    if (__DEV__ && skipEmailVerification) {
      this.onUserInfoSuccessAndBook({isEmailVerified: true}, roomDetail);
      return;
    }

    const onSuccess = (data) => this.onUserInfoSuccessAndBook(data, roomDetail);
    serverRequest(this, requester.getUserInfo, [], onSuccess, this.onUserInfoError);
  }

  onUserInfoError(errorData, errorCode) {
    this.refs.toast.show(lang.TEXT.NETWORK_ERROR, 5000);
  }

  onUserInfoSuccessAndBook(data, roomDetail) {
    const { isEmailVerified } = data;
    if (!isEmailVerified) {
      MessageDialog.showMessage(this, "Email Verification", lang.TEXT.VERIFICATION_EMAIL_MESSAGE, "email-verification");
      return
    }

    if (hotelSearchIsNative.step3BookingDetails) {
      // onRoomPress = (roomDetail) => {
      //console.log("onRoomPress", roomDetail);
      let hotelImg = this.state.hotel.hotelPhoto.url;
      if (hotelImg === undefined || hotelImg === null) {
        hotelImg = this.state.hotel.hotelPhoto;
      }
      const {
        guests,
        searchString,
        hotelFullDetails,
        daysDifference
      } = this.state;
      this.props.navigation.navigate("GuestInfoForm", {
        price: (roomDetail.roomsResults[0].price * daysDifference).toFixed(2),
        hotelDetails: hotelFullDetails,
        hotelImg: hotelImg,
        roomDetail,
        guests,
        daysDifference,
        searchString
      });
    } else {
      throw new Error('[HotelDetails] Webview version for booking is not implemented - see onUserInfoSuccessAndBook');
      // const { bookingId, searchString } = this.state;
      // const { quoteId } = roomDetail;
      // // const { currency } = this.props;
      // const { token, email } = this.props.loginDetails;
      // // const rooms = (  JSON.stringify(booking.rooms)  );
      // // const search = StringUtils.subBeforeIndexOf(searchString, '&rooms=') +
      // const search = searchString +
      //     `&quoteId=${quoteId}&authToken=${token}&authEmail=${email}`;
      // const state = { currency, token, email };
      // const extra = {
      //     webViewUrl: `mobile/hotels/listings/${bookingId}/confirm${search}`,
      //     message: 'Preparing booking information ...',
      //     backText: 'Back'
      // };
      // gotoWebview(state, this.props.navigation, extra);
    }
  };

  onSendVerificationEmail() {
    const { onVerificationEmailSuccess, onVerificationEmailError } = this;
    const { searchString, hotel } = this.state;
    const emailVerificationRedirectURL = `/hotels/listings/${hotel.id}${searchString}`;

    serverRequest(this, requester.sendVerificationEmail,[{emailVerificationRedirectURL}], onVerificationEmailSuccess, onVerificationEmailError);
  }

  onVerificationEmailSuccess(data) {
    if (data.isVerificationEmailSent) {
      this.refs.toast.show(lang.TEXT.VERIFICATION_EMAIL_SUCCESS, 4000);
    } else {
      this.refs.toast.show(lang.TEXT.VERIFICATION_EMAIL_ERROR, 4000);
    }
  }
  
  onVerificationEmailError(errorData, errorCode) {
    this.refs.toast.show(lang.TEXT.VERIFICATION_EMAIL_ERROR, 4000);
  }

  _renderBackButton() {
    return (
      <View style={styles.backButtonContainer}>
        <BackButton onPress={this.onClose} isWhite style={styles.backButton} />
      </View>
    );
  }

  _renderToast() {
    return (
      <Toast
        ref="toast"
        style={{ backgroundColor: "#DA7B61" }}
        position={'center'}
        fadeInDuration={500}
        fadeOutDuration={500}
        opacity={1.0}
        textStyle={{ color: "white", ...commonText }}
      />
    )
  }

  _renderHotelDetails() {
    const { dataSourcePreview, hotel, mainAddress, description } = this.state;

    const { name, star } = hotel;

    return (
      <HotelDetailView
        dataSourcePreview={dataSourcePreview}
        title={name}
        rateVal={star}
        reviewNum={0}
        address={mainAddress}
        description={description}
      />
    );
  }

  _renderFacilities() {
    return [
      <FacilitiesView
        key={"facility_view"}
        style={styles.roomfacility}
        data={this.state.hotelAmenities}
        isHome={false}
        onFacilityMore={this.onFacilityMore}
      />,

      <View
        key={"facility_separator1"}
        style={[
          styles.lineStyle,
          {
            marginLeft: 20,
            marginRight: 20,
            marginTop: 15,
            marginBottom: 15
          }
        ]}
      />
    ];
  }

  _renderAvailableRooms() {
    return [
      <AvailableRoomsView
        key={"facility_rooms"}
        id={`${this.state.hotel.id}`}
        search={this.state.searchString}
        onBooking={this.onTryBooking}
        guests={this.state.guests}
        hotelDetails={this.state.hotelFullDetails}
        daysDifference={this.state.daysDifference}
      />,

      <View
        key={"facility_separator2"}
        style={[
          styles.lineStyle,
          {
            marginLeft: 20,
            marginRight: 20,
            marginTop: 15,
            marginBottom: 15
          }
        ]}
      />
    ];
  }

  _renderLocation() {
    if (!OPTIONS.hotelDetails.showLocation) {
      return;
    }

    return (
      <TouchableOpacity activeOpacity={1} onPress={() => this.onMapTap()}>
        <LocationView
          location={`${this.state.mainAddress}, ${this.state.countryName}`}
          titleStyle={{ fontSize: 17 }}
          name={this.state.hotel.name}
          description={this.state.hotel.generalDescription}
          lat={
            this.state.latitude != null ? parseFloat(this.state.latitude) : 0.0
          }
          lon={
            this.state.longitude != null
              ? parseFloat(this.state.longitude)
              : 0.0
          }
          radius={200}
          isLoading={!this.state.canLoadLocation}
        />
      </TouchableOpacity>
    );
  }

  _renderMessage() {
    const { messageTitle, dialogMessage, dialogContent, messageVisible } = this.state;

    return (
      <MessageDialog
        parent={this}
        title={messageTitle}
        message={dialogMessage}
        content={dialogContent}
        isVisible={messageVisible}
        onOk={this.onSendVerificationEmail}
      />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f1f3" />
        <ScrollView style={styles.scrollView}>
          <View style={styles.body}>
            <ImageSlides data={this.state.dataSourcePreview} height={SCREEN_SIZE.H / 3} />

            {this._renderHotelDetails()}

            {this._renderFacilities()}

            {this._renderAvailableRooms()}

            {this._renderLocation()}
          </View>
        </ScrollView>
        {this._renderBackButton()}
        {this._renderToast()}
        {this._renderMessage()}
      </View>
    );
  }
}

let mapStateToProps = state => {
  return {
    datesAndGuestsData: state.userInterface.datesAndGuestsData,
    searchString: state.hotels.searchString,
    currency: state.currency.currency,
    loginDetails: state.userInterface.loginDetails
  };
};

export default connect(mapStateToProps)(HotelDetails);
