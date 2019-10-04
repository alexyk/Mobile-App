import { Image, Text, TouchableOpacity, View } from "react-native";
import React, { Component } from "react";

import PropTypes from "prop-types";
import Toast from "react-native-simple-toast";
import _ from "lodash";
import { connect } from "react-redux";
import requester from "../../../initDependencies";
import styles from "./styles";
import LTLoader from "../../molecules/LTLoader";
import { serverRequest } from "../../../services/utilities/serverUtils";
import { OPTIONS } from "../../../config-settings";

class MyTrips extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func
    })
  };

  constructor() {
    super();
    this.state = {
      isLoading: true,
      myTrips: [],
      hasPendingTrips: false
    };
    this.gotoMyTrips = this.gotoMyTrips.bind(this);
    this.gotoBooking = this.gotoBooking.bind(this);
    this.getTripsFromServer = this.getTripsFromServer.bind(this);
    this.onExplorePress = this.onExplorePress.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { state } = this;

    return (
      state.myTrips !== nextState.myTrips ||
      state.isLoading !== nextState.isLoading
    );
  }

  componentDidMount() {
    //console.log('did mount-----', this.props);
    this.getTripsFromServer();
  }

  componentDidUpdate(prevProps) {
    //console.log('did update-----', prevProps.navigation.state.params);
    if (this.state.hasPendingTrips) {
      this.props.navigation.navigate("UserMyTrips", {
        trips: this.state.myTrips,
        gotoBooking: this.gotoBooking
      });
    }
  }

  hideProgress() {
    this.setState({ isLoading: false });
  }

  getTripsFromServer() {
    serverRequest(this, requester.getMyHotelBookings, ['page=0', OPTIONS.MAX_TRIPS_TO_LOAD],
      data => {
        let tripArray = _.orderBy(data, ["arrival_date"], ["desc"]);

        this.setState({
          myTrips: tripArray,
          hasPendingTrips: data.length > 0,
          isLoading: false
        });
      },
      (errorData, errorMessages) => {
        this.hideProgress();
        Toast.showWithGravity("Cannot get messages, Please check network connection.", Toast.SHORT, Toast.BOTTOM);
      }
    );
  }

  gotoBooking() {
    this.props.navigation.navigate("EXPLORE");
  }

  gotoMyTrips = () => {
    this.props.navigation.navigate("UserMyTrips", {
      trips: this.state.myTrips
    });
  };

  onExplorePress() {
    const { length } = this.state.myTrips;

    if (length > 0) {
      this.gotoMyTrips();
    } else {
      this.gotoBooking();
    }
  }

  render() {
    const { isLoading } = this.state;

    if (isLoading) {
      return <LTLoader message={"Loading trips ..."} />;
    } else {
      return (
        <View style={styles.container}>
          <View style={styles.placeholderImageView}>
            <Image
              style={styles.placeholderImage}
              source={require("../../../assets/placeholder_mytrips.png")}
            />
          </View>
          <Text style={styles.title}>You have no upcoming trips</Text>
          <Text style={styles.subtext}>Discover your next experience</Text>
          <TouchableOpacity
            onPress={this.onExplorePress}
            style={styles.buttonExplore}
          >
            <Text style={styles.exploreBtnText}>Start Exploring</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
}

const mapStateToProps = () => {
  return { screenName: "MYTRIPS" };
};

export default connect(mapStateToProps)(MyTrips);
