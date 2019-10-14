import {
  AsyncStorage,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles";

import ProgressDialog from "../../../atoms/SimpleDialogs/ProgressDialog";
import SmartInput from "../../../atoms/SmartInput";
import WhiteBackButton from "../../../atoms/WhiteBackButton";
import { userInstance } from "../../../../utils/userInstance";
import requester from "../../../../initDependencies";
import { serverRequest } from "../../../../services/utilities/serverUtils";
import moment from "moment";
import store from "../../../../initDependencies";
import { setLoginDetails } from "../../../../redux/action/userInterface";
import DBG from "../../../../config-debug";

var arr = [];

class WalletKeywordValidation extends Component {
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

    this.state = {
      walletAddress: "",
      walletJson: "",
      walletMnemonic: "",
      keysArray: [null, null, null],
      keywordsArray: ["", "", ""],
      keyword1: "",
      keyword2: "",
      keyword3: ""
    };

    this.onClickAccept = this.onClickAccept.bind(this);
  }

  async componentDidMount() {
    // TODO: Remove usage of AsyncStorage
    this.setState({
      walletAddress: await AsyncStorage.getItem("walletAddress"),
      walletJson: await AsyncStorage.getItem("walletJson"),
      walletMnemonic: await AsyncStorage.getItem("walletMnemonic")
    });
    this.load();
  }

  load = () => {
    arr = [];
    while (arr.length < 3) {
      var randomnumber = Math.floor(Math.random() * 12) + 1;
      if (arr.indexOf(randomnumber) > -1) continue;
      arr[arr.length] = randomnumber;
    }
    this.setState({ keysArray: arr });
  };

  onChangeHandler(index) {
    return value => {
      //this.setState({ [property]: value });
      this.state.keywordsArray[index] = value;
      this.forceUpdate();
    };
  }

  suffix(i) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "st";
    }
    if (j == 2 && k != 12) {
      return i + "nd";
    }
    if (j == 3 && k != 13) {
      return i + "rd";
    }
    return i + "th";
  }

  correctAnswersCount = () => {
    var count = 0;
    for (var i = 0; i < this.state.keysArray.length; i++) {
      if (
        this.state.keywordsArray[i].toLowerCase() ===
        this.state.walletMnemonic
          .split(" ")
          [this.state.keysArray[i] - 1].toLowerCase()
      ) {
        //console.log(true);
        count += 1;
      }
    }
    return count;
  };

  async onClickAccept() {
    const { navigate } = this.props.navigation;

    // Debugging wallet registration flow
    if (__DEV__ && DBG.walletFlowDebug) {
      navigate("CongratsWallet");
      return;
    }


    if (this.correctAnswersCount() === 3) {
      const { params } = this.props.navigation.state;
      let user = params;
      //console.log("onClickAccept", user);

      this.setState({ showProgress: true });
      serverRequest(this, requester.getUserInfo, [],
        userInfo => {
          if (userInfo.birthday != null) {
            let birthday = moment.utc(userInfo.birthday);
            const day = birthday.add(1, "days").format("D");
            const month = birthday.format("MM");
            const year = birthday.format("YYYY");
            userInfo.birthday = `${day}/${month}/${year}`;
          }

          userInfo.countryState =
            userInfo.countryState && userInfo.countryState.id;
          userInfo.preferredCurrency = userInfo.preferredCurrency
            ? userInfo.preferredCurrency.id
            : 1;
          userInfo.country = userInfo.country && userInfo.country.id;
          userInfo.countryState =
            userInfo.countryState && parseInt(userInfo.countryState, 10);
          userInfo.locAddress = params.walletAddress;
          userInfo.jsonFile = params.walletJson;

          serverRequest(this, requester.updateUserInfo, [userInfo, null],
            data => {
              this.setState({ showProgress: false });
              navigate("CongratsWallet");

              store.dispatch(setLoginDetails({walletAddress: params.walletAddress, walletJson: params.walletJson}));
            },
            (errorData, errorCode) => {
              this.setState({ showProgress: false });
              Toast.showWithGravity(
                "Cannot get messages, Please check network connection.",
                Toast.SHORT,
                Toast.BOTTOM
              );
            }
          );
        },
        (errorData, errorCode) => {
          this.setState({ showProgress: false });
        }
      );
    } else {
      alert("Answers are not correct please retry");
    }
  };

  render() {
    const { navigate, goBack } = this.props.navigation;
    const { walletMnemonic } = this.state;
    let i = 0;
    return (
      <ScrollView
        showsHorizontalScrollIndicator={false}
        style={{ width: "100%", backgroundColor: "#DA7B61" }}
      >
        <TouchableWithoutFeedback>
          <View style={styles.container}>
            <WhiteBackButton
              style={styles.closeButton}
              onPress={() => goBack()}
            />

            <View style={styles.main}>
              <View style={styles.titleView}>
                <Text style={styles.titleText}>Confirm Wallet Information</Text>
              </View>

              <View style={styles.infoView}>
                <Text style={styles.infoText}>
                  Enter Your mnemonic recovery keywords.
                </Text>
              </View>

              <View style={styles.inputView}>
                <SmartInput
                  value={this.state.keywordWrittenByUser}
                  onChangeText={this.onChangeHandler(0)}
                  placeholder={`Enter ${this.suffix(
                    this.state.keysArray[0]
                  )} mnemonic keyword`}
                  placeholderTextColor="#fff"
                />
              </View>

              <View style={styles.inputView}>
                <SmartInput
                  autoCorrect={false}
                  value={this.state.keywordWrittenByUser}
                  onChangeText={this.onChangeHandler(1)}
                  placeholder={`Enter ${this.suffix(
                    this.state.keysArray[1]
                  )} mnemonic keyword`}
                  placeholderTextColor="#fff"
                />
              </View>

              <View style={styles.inputView}>
                <SmartInput
                  autoCorrect={false}
                  value={this.state.keywordWrittenByUser}
                  onChangeText={this.onChangeHandler(2)}
                  placeholder={`Enter ${this.suffix(
                    this.state.keysArray[2]
                  )} mnemonic keyword`}
                  placeholderTextColor="#fff"
                />
              </View>

              <View style={styles.buttonsView}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                  style={{
                    width: "50%",
                    borderRadius: 25,
                    borderColor: "#FFF",
                    borderWidth: 1.5,
                    backgroundColor: "#DA7B61",
                    marginRight: 5,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text style={styles.declineButtonText}>
                    I didn't write down my keywords
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.onClickAccept()}
                  style={{
                    width: "50%",
                    borderRadius: 25,
                    borderColor: "#FFF",
                    borderWidth: 1.5,
                    backgroundColor: "#FFF",
                    marginLeft: 5,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text style={styles.acceptButtonText}>Continue</Text>
                </TouchableOpacity>
                {/*<TouchableOpacity onPress={() => navigate('CreateWallet', { ...params })}>*/}
                {/*<View style={styles.acceptButtonView}>*/}
                {/*/!*<Text style={styles.acceptButtonText}>I didn't write down my keywords</Text>*!/*/}
                {/*</View>*/}
                {/*</TouchableOpacity>*/}

                {/*<TouchableOpacity onPress={this.onDecline}>*/}
                {/*<View style={styles.declineButtonView}>*/}
                {/*/!*<Text style={styles.declineButtonText}>Continue</Text>*!/*/}
                {/*</View>*/}
                {/*</TouchableOpacity>*/}
              </View>
            </View>
            <ProgressDialog
              visible={this.state.showProgress}
              title=""
              message="Finalizing…"
              animationType="slide"
              activityIndicatorSize="large"
              activityIndicatorColor="black"
            />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    );
  }
}

export default WalletKeywordValidation;
