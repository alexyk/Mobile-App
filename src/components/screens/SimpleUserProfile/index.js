import { ScrollView, Text, View } from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";

import BackButton from "../../atoms/BackButton";
import Image from "react-native-remote-svg";
import ProfileHistoryItem from "../../atoms/ProfileHistoryItem";
import ProgressDialog from "../../atoms/SimpleDialogs/ProgressDialog";
import PropTypes from "prop-types";
import { imgHost, PUBLIC_URL } from "../../../config.js";
import moment from "moment";
import styles from "./styles";

class SimpleUserProfile extends Component {
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

    const { loginDetails } = props;
    const { birthday, profileImage } = loginDetails;

    let day = "00";
    let month = "00";
    let year = "0000";
    if (birthday !== null) {
      let asMoment = moment.utc(parseInt(birthday));
      day = asMoment.format("DD");
      month = asMoment.format("MM");
      year = asMoment.format("YYYY");
    }

    this.state = {
      birthdayDisplay: day + "/" + month + "/" + year,
      showProgress: false,
      loadMessage: "loading...",
      image: profileImage == null ? "" : profileImage,
      ...loginDetails
    };
  }


  render() {
    const { goBack } = this.props.navigation;
    const { locAddress } = this.props.loginDetails;
    let { gender, image } = this.state;

    if (gender === "men") {
      gender = "M";
    } else if (gender === "women") {
      gender = "F";
    } else {
      gender = "?";
    }

    if (image != "") {
      if (image.indexOf("images/default.png".toLowerCase()) != -1) {
        image = { uri: PUBLIC_URL + "images/default.png" };
      } else {
        image = { uri: imgHost + image };
      }
    }

    return (
      <View style={styles.container}>
        <View style={styles.navContainer}>
          <View style={styles.titleConatiner}>
            <BackButton style={styles.closeButton} onPress={() => goBack()} />
            <Text style={styles.title}>Profile</Text>
          </View>
        </View>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          style={{ width: "100%" }}
        >
          <View style={styles.body}>
            <View style={styles.topContainer}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarView}>
                  {this.state.image == "" ? (
                    <Image
                      style={styles.avatar}
                      source={require("../../../assets/temple/user_profile_avatar.png")}
                    />
                  ) : (
                    <Image style={styles.avatar} source={image} />
                  )}
                </View>
                <Text style={styles.gender}>{gender}</Text>
              </View>
              <Text style={styles.name}>
                {this.state.firstName} {this.state.lastName}
              </Text>
              {this.state.city == "" ? (
                <Text style={styles.location}>
                  {this.state.country == null ? "" : this.state.country.name}
                </Text>
              ) : (
                <Text style={styles.location}>
                  {this.state.city == null ? "" : this.state.city.name}{" "}
                  {this.state.country == null ? "" : this.state.country.name}
                </Text>
              )}
            </View>

            <View
              style={[styles.lineStyle, { marginLeft: 0, marginRight: 0 }]}
            />
            <ProfileHistoryItem
              style={styles.historyStyle}
              title={"Birthdate"}
              detail={this.state.birthdayDisplay}
            />

            <View style={styles.lineStyle} />
            <ProfileHistoryItem
              style={styles.historyStyle}
              title={"Email"}
              detail={this.state.email}
            />

            <View style={styles.lineStyle} />
            <ProfileHistoryItem
              style={styles.historyStyle}
              title={"Phone number"}
              detail={this.state.phoneNumber}
            />

            <View style={styles.lineStyle} />
            <ProfileHistoryItem
              style={styles.historyStyle}
              title={"ETH/LOC address"}
              detail={locAddress}
            />

            {/* <View style={styles.lineStyle} /> */}
            {/* <ProfileHistoryItem
              style={styles.historyStyle}
              title={"Preferred language"}
              detail={this.state.preferredLanguage}
            /> */}

            {/* <View style={styles.lineStyle} />
            <ProfileHistoryItem
              style={styles.historyStyle}
              title={"Preferred currency"}
              detail={this.state.currency}
            /> */}
          </View>
        </ScrollView>
        <ProgressDialog
          visible={this.state.showProgress}
          title=""
          message={this.state.loadMessage}
          animationType="fade"
          activityIndicatorSize="large"
          activityIndicatorColor="black"
        />
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginDetails: state.userInterface.loginDetails
  };
};

export default connect(mapStateToProps)(SimpleUserProfile);
