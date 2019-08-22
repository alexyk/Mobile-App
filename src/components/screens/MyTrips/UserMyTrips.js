import { FlatList, Image, Text, View } from "react-native";
import React, { Component } from "react";
import { imgHost } from "../../../config";

import Dash from "react-native-dash";
import PropTypes from "prop-types";
import _ from "lodash";
import moment from "moment";
import requester from "../../../initDependencies";
import { userInstance } from "../../../utils/userInstance";
import styles from "./styles";
import lang from "../../../language/";
import SearchBar from "../../molecules/SearchBar";
import LTIcon from "../../atoms/LTIcon";

class UserMyTrips extends Component {
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

    const { trips } = props.navigation.state.params;

    // State
    this.state = {
      page: 0,
      userImageUrl: "",
      isLoading: true,
      trips,
      allTrips: trips
    };

    this.renderItem = this.renderItem.bind(this);
    this.renderHotelImage = this.renderHotelImage.bind(this);
    this.renderStatusText = this.renderStatusText.bind(this);
    this.renderRefNoText = this.renderRefNoText.bind(this);
    this.renderBookingStatusAndRefNo = this.renderBookingStatusAndRefNo.bind(
      this
    );
    this.onServerMyTrips = this.onServerMyTrips.bind(this);
    this.refreshFilterResult = this.refreshFilterResult.bind(this);
    this.filterTrips = this.filterTrips.bind(this);
    this.clearFilterDelay = this.clearFilterDelay.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);
    this.onFilterTrips = this.onFilterTrips.bind(this);

    this.filterDelay = -1;
  }

  async componentDidMount() {
    // Loading user info for user image
    let profileImage = await userInstance.getProfileImage();
    this.setState({ userImageUrl: profileImage == null ? "" : profileImage });
  }

  clearFilterDelay() {
    if (this.filterDelay != -1) {
      clearTimeout(this.filterDelay);
      this.filterDelay = -1;
    }
  }

  refreshFilterResult() {
    const value = this.refs.searchBar.input._lastNativeText;
    this.clearFilterDelay();
    this.filterTrips(value);
  }

  filterTrips(value) {
    const filterValueLower = value.toLowerCase();
    const filterValueUpper = value.toUpperCase();

    if (filterValueLower.length <= 1) {
      this.setState({ trips: this.state.allTrips.concat() });
    } else {
      let tmpTrips = this.state.allTrips.concat();
      tmpTrips = tmpTrips.filter(item => {
        let { hotel_name, arrival_date, status, booking_id } = item;

        // hotel name filter
        let hotelName = hotel_name.toLowerCase().indexOf(filterValueLower) > -1;
        const bookingId =
          booking_id && booking_id.toString().indexOf(filterValueLower) > -1;

        // status filter
        status =
          status &&
          lang.SERVER.BOOKING_STATUS[status] &&
          lang.SERVER.BOOKING_STATUS[status]
            .toString()
            .indexOf(filterValueUpper) > -1;

        // arrival date
        const tmpDate = moment(arrival_date).utc();
        let arrivalDate = false;
        const tmpDateFilters = [
          tmpDate.format("DD MMM").toLowerCase(), // [2-digit day] [3-letter month] (space in between)
          tmpDate.format("MMMM").toLowerCase(), // month full name
          tmpDate.format("MM-YYYY"), // [2-digit month]-[4-digit year]
          tmpDate.format("YYYY-MM"), // [4-digit year]-[2-digit month]
          tmpDate.year() // year
        ];
        for (let current of tmpDateFilters) {
          if (current.toString().indexOf(filterValueLower) > -1) {
            arrivalDate = true;
            break;
          }
        }

        return hotelName || bookingId || status || arrivalDate;
      });

      this.setState({ trips: tmpTrips });
      this.clearFilterDelay();
    }
  }

  onFilterTrips(event) {
    this.refreshFilterResult();
  }

  onServerMyTrips(data) {
    let allTrips = this.state.allTrips.concat(data.content);

    this.setState({
      trips: allTrips,
      allTrips,
      isLast: data.last,
      page: pageNumber,
      isLoading: false
    });
  }

  onFilterChanged(value) {
    this.clearFilterDelay();
    const func = this.filterTrips;
    this.filterDelay = setTimeout(
      function(value) {
        func(value);
      },
      200,
      value
    );
  }

  getAllTrips() {
    let pageNumber = this.state.page + 1;
    if (!this.state.isLast && !this.state.isLoading) {
      this.setState({ isLoading: true });
      // second parameter of getMyHotelBookings() is size - 1000 is max and will return all bookings at once
      requester.getMyHotelBookings([`page=${pageNumber}`], 1000).then(res => {
        res.body.then(this.onServerMyTrips).catch(err => {
          //console.log(err);
        });
      });
    }
  }

  calcItemData(item) {
    let invalidData = false;
    let hotelImageURL = null;
    let error; // {debug:String, error:Object}
    let imageAvatar = "";

    // check if data is valid
    if (item && item.item && item.item.hotel_photo) {
      try {
        let photoJSONData = item.item.hotel_photo;
        const thumb = JSON.parse(photoJSONData).thumbnail;

        // Filter out images with known pattern of non-available image
        // Display them as blank image placeholder.
        // (the component with testID={'blankImageContainer'} in this.renderHotelImage())
        if (thumb.indexOf("not-available") == -1) {
          hotelImageURL = `${imgHost}${thumb}`;
        }

        if (this.state.image != "") {
          imageAvatar = { uri: imgHost + this.state.userImageUrl };
        }
      } catch (err) {
        error = {
          debug:
            "Error in parsing hotel image thumbnail or getting avatar url from state.",
          error: err
        };
        invalidData = true;
      }
    } else {
      invalidData = true;
      error = {
        debug:
          "Error in hotel data object from server - item/item.item/item.hotel_photo is null",
        error: {}
      };
    }

    // if invalid hotel data
    if (invalidData) {
      console.warn("Error in hotel item data", { error, hotelData: item });
    }

    const arrivalDate = moment(item.item.arrival_date).utc();
    const day = arrivalDate.format("DD").toString();
    const month = arrivalDate.format("MMM").toString();
    const dateInCircle = `${day}\n${month}`;

    const dateFormat = "DD MMM, YYYY"; // example: "01 Oct, 2019"
    const dateFrom = arrivalDate.format(dateFormat).toString();
    const dateTo = arrivalDate
      .add(item.item.nights, "day")
      .format(dateFormat)
      .toString();
    const arrow = <LTIcon name={"longArrowRight"} size={12} />;

    return {
      hotelImageURL,
      imageAvatar,
      dateInCircle,
      dateFrom,
      dateTo,
      arrow
    };
  }

  calcBookingStatusAndRefNo(item) {
    let status;
    let refNo;

    try {
      status = item.item.status;
      refNo = item.item.booking_id;
    } catch (err) {
      console.warn(
        "Error while getting My Trips -> booking -> (status or reference no) ",
        { error: err }
      );
      status = "";
    }

    return {
      refNo,
      status
    };
  }

  renderAvatar(enabled, imageAvatar) {
    if (enabled) {
      return (
        <View style={styles.flatListBottomView}>
          <View style={styles.flatListUserProfileView}>
            <Image style={styles.senderImage} source={imageAvatar} />
          </View>
        </View>
      );
    } else {
      return <View />;
    }
  }

  renderRefNoText(refNo) {
    return (
      <Text style={styles.textBookingId}>
        {`${lang.TEXT.MY_TRIPS_BOOKING_REF_NO}: ${refNo}`}
      </Text>
    );
  }

  renderStatusText(status) {
    return (
      <Text style={styles.textBookingStatus}>
        {`${lang.TEXT.MY_TRIPS_BOOKING_STATUS}: ${status}`}
      </Text>
    );
  }

  renderBookingStatusAndRefNo(item) {
    const { refNo, status } = this.calcBookingStatusAndRefNo(item);
    const statusValue = lang.SERVER.BOOKING_STATUS[status];
    let bookingStatusRendered,
      hasStatus = statusValue != undefined,
      hasRefNo = false;

    if (
      status == "" ||
      status == null ||
      status == "null" ||
      status == "undefined" ||
      status == "PENDING_SAFECHARGE_CONFIRMATION" ||
      statusValue == null
    ) {
      bookingStatusRendered = <View testID={"renderBookingStatus1"} />;
    } else if (status == "DONE") {
      hasStatus = true;
      hasRefNo = true;
      bookingStatusRendered = (
        <View
          testID={"renderBookingStatus2"}
          style={styles.hotelBookingStatusContainer}
        >
          {this.renderStatusText(statusValue)}
          {this.renderRefNoText(refNo)}
        </View>
      );
    } else {
      hasStatus = true;
      bookingStatusRendered = (
        <View
          testID={"renderBookingStatus3"}
          style={styles.hotelBookingStatusContainer}
        >
          {this.renderStatusText(statusValue)}
        </View>
      );
    }

    return { bookingStatusRendered, hasStatus, hasRefNo };
  }

  renderHotelImage(hotelImageURL) {
    let result;

    if (hotelImageURL == null) {
      result = (
        <View
          style={styles.hotelImageContainerNoImage}
          testID={"blankImageContainer"}
        >
          {/* <View style={styles.hotelImageNoImage}> */}
          <Text style={styles.txtHotelNoImage}>
            {lang.TEXT.MYTRIPS_NO_IMAGE}
          </Text>
          {/* </View> */}
        </View>
      );
    } else {
      result = (
        <View style={styles.hotelImageContainer} testID={"imageContainer"}>
          <Image style={styles.hotelImage} source={{ uri: hotelImageURL }} />
        </View>
      );
    }

    return result;
  }

  renderItem(item) {
    let hotelName = item.item.hotel_name;
    const {
      hotelImageURL,
      imageAvatar,
      dateInCircle,
      dateFrom,
      dateTo,
      arrow
    } = this.calcItemData(item);
    const {
      bookingStatusRendered,
      hasStatus,
      hasRefNo
    } = this.renderBookingStatusAndRefNo(item);
    let style = [styles.flatListMainView];
    let extraStyle = {};

    if (hasStatus && hasRefNo) {
      extraStyle = { height: 270 };
    } else if (hasStatus && !hasRefNo) {
      extraStyle = { height: 250 };
    } else {
      // no status, no ref no
      extraStyle = { height: 220 };
    }

    // fix for hotels with 2-line name
    extraStyle.height += 30;

    style.push(extraStyle);

    return (
      <View style={style}>
        <View>
          <View style={styles.img_round}>
            <Text style={styles.img_round_text}>{dateInCircle}</Text>
          </View>
          <Dash
            dashColor="#dedede"
            dashStyle={{ borderRadius: 80, overflow: "hidden" }}
            style={{
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          />
        </View>
        <View style={styles.flatListDataView}>
          <View ref={""} style={styles.flatListTitleView}>
            <Text style={styles.subtext1}>
              {dateFrom} {arrow} {dateTo}
            </Text>
            <Text style={styles.subtitle}>Check into {hotelName}</Text>
          </View>

          {this.renderHotelImage(hotelImageURL)}
          {bookingStatusRendered}

          {/* disabled avatar */}
          {this.renderAvatar(false, imageAvatar)}
        </View>
      </View>
    );
  }

  render() {
    const { search } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.chatToolbar}>
          <Text style={styles.title}>My Trips</Text>
        </View>
        <View style={styles.searchAndPickWrapView}>
          <View style={styles.seachView}>
            <SearchBar
              ref={"searchBar"}
              autoCorrect={false}
              value={search}
              onChangeText={this.onFilterChanged}
              placeholder={lang.TEXT.MYTRIPS_FILTER}
              placeholderTextColor="#bdbdbd"
              leftIcon="search"
              onLeftPress={this.onFilterTrips}
            />
          </View>
        </View>

        <FlatList
          style={styles.flatList}
          data={this.state.trips}
          onEndReachedThreshold={0.5}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}

export default UserMyTrips;
