import {
  AsyncStorage,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";
import { NavigationActions, StackActions } from "react-navigation";
import Toast from "react-native-simple-toast";

import Image from "react-native-remote-svg";
import PropTypes from "prop-types";
import SplashScreen from "react-native-smart-splash-screen";
import { autobind } from "core-decorators";
import styles from "./styles";
import { validateEmail, validatePassword1 } from "../../../../utils/validation";
import SmartInput from "../../../atoms/SmartInput";
import { domainPrefix } from "../../../../config";
import requester from "../../../../initDependencies";
import LoginLocationDialog from "../../../atoms/LoginLocationDialog";
import LoginEmailVerifyDialog from "../../../atoms/LoginEmailVerifyDialog";
import { SERVER_ERROR, serverRequest } from "../../../../services/utilities/serverUtils";
import LTLoader from "../../../molecules/LTLoader";

class Login extends Component {
  static propTypes = {
    // react-navigation
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);

    const { params } = props.navigation.state;

    this.state = {
      email: params && params.email ? params.email : "",
      password: "",
      showProgress: false,
      locationDialogVisible: false,
      verificationDialogVisible: false
    };
  }

  componentDidMount() {
    console.disableYellowBox = true;
    SplashScreen.close({
      animationType: SplashScreen.animationType.scale,
      duration: 850,
      delay: 500
    });

    // auto focus if email set
    if (this.state.email != "" && this.passTextRef) {
      alert("Log in with Facebook was not possible. Please enter your password manually.");
      setTimeout(() => this.passTextRef.input.focus(), 50);
    }
  }

  // TODO: Need a way to generate a Google ReCAPTCHA token // old comment by abhi, e5e0b8fa2...

  onClickLogIn() {
    const { email, password } = this.state;

    if (!validateEmail(email)) {
      Toast.showWithGravity('Please enter a valid email.', Toast.SHORT, Toast.CENTER);
      return;
    }
    if (!validatePassword1(password)) {
      Toast.showWithGravity('Please enter a valid password - at least 8 characters long and containing at least one letter an one digit.', Toast.LONG, Toast.CENTER);
      return;
    }

    this.handleLogin();
  }

  handleLogin(countryID = null, emailVerificationToken = null) {
    const { email, password } = this.state;
    const user = { email, password };
    if (countryID != null) {
      user.country = countryID;
    }
    if (emailVerificationToken != null) {
      user.emailVerificationToken = emailVerificationToken;
    }

    this.setState({ showProgress: true });

    // prettier-ignore
    serverRequest(this, requester.login, [user], this.onServerLoginSuccess, this.onServerLoginError);
  }

  onServerLoginSuccess(data) {
    this.setState({ showProgress: false });

    // TODO: Get first name + last name from response included with Authorization token (Backend) // old comment by Kristyan Serafimov, 3096572...
    const { email } = this.state;
    const { Authorization } = data;
    AsyncStorage.setItem(`${domainPrefix}.auth.username`, email);
    AsyncStorage.setItem(`${domainPrefix}.auth.locktrip`, Authorization);

    let resetAction = StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({ routeName: "MainScreen" })]
    });
    this.props.navigation.dispatch(resetAction);
  }


  onServerLoginError(data, errorCode) {
    this.setState({ showProgress: false });

    switch (errorCode) {

      case SERVER_ERROR.LEVEL_1:
        alert("Cannot login. Please check network connection.");
        break;
      
      case SERVER_ERROR.LEVEL_3_FROM_SERVER:
          const { errors } = data;

          if (errors && errors.hasOwnProperty("CountryNull")) {
            this.setState({ locationDialogVisible: true });
          } else if (errors && errors.hasOwnProperty("EmailNotVerified")) {
            this.setState({ verificationDialogVisible: true });
          } else {
            Object.keys(errors).forEach(key => {
              if (typeof key !== "function") {
                // Toast.showWithGravity(errors[key].message, Toast.SHORT, Toast.BOTTOM);
                //console.log('Error logging in  :', errors[key].message);
                alert(errors[key].message);
              }
            });
          }
          break;
    }
  }


  @autobind
  onChangeHandler(property) {
    return value => {
      this.setState({ [property]: value });
    };
  }

  render() {
    const { email, password, showProgress } = this.state;

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.chatToolbar}>
            <TouchableOpacity onPress={this.onBackPress}>
              <Image
                style={styles.btn_backImage}
                source={require("../../../../assets/icons/icon-back-white.png")}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.main}>
            <View style={styles.titleView}>
              <Text style={styles.titleText}>Login</Text>
            </View>

            <View style={styles.inputView}>
              <SmartInput
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                value={email}
                onChangeText={this.onChangeHandler("email")}
                placeholder="Email"
                placeholderTextColor="#fff"
                rightIcon={validateEmail(email) ? null : "close"}
              />
            </View>

            <View style={styles.inputView}>
              <SmartInput
                ref={ref => (this.passTextRef = ref)}
                secureTextEntry
                autoCorrect={false}
                autoCapitalize="none"
                value={password}
                onChangeText={this.onChangeHandler("password")}
                placeholder="Password"
                placeholderTextColor="#fff"
                rightIcon={validatePassword1(password) ? null : "close"}
              />
            </View>

            <TouchableOpacity
              style={styles.buttonWrapper}
              disabled={false}
              onPress={() => this.onClickLogIn()}
            >
              <View style={styles.LogInButton}>
                <Text style={styles.buttonText}>Log In</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.lowOpacity}>
            <Image
              source={require("../../../../assets/get-started-white-outline.png")}
              style={styles.getStartedImage}
            />
          </View>

          <LTLoader isLoading={showProgress} message="Logging in ..." onPress={event => this.setState({showProgress: false})}/>

          <LoginLocationDialog
            countries={this.props.countries}
            title={"Select Currency"}
            visible={this.state.locationDialogVisible}
            okLabel={"OK"}
            onOk={countryID => {
              //console.log("select country", countryID);
              this.setState({ locationDialogVisible: false });
              this.handleLogin(countryID);
            }}
          />

          <LoginEmailVerifyDialog
            title={"Email Verification"}
            visible={this.state.verificationDialogVisible}
            okLabel={"Verify"}
            cancelLabel={"Already Verified"}
            onCancel={() => {
              this.setState({ verificationDialogVisible: false });
            }}
            onOk={emailToken => {
              //console.log("email verify", emailToken);
              this.setState({ verificationDialogVisible: false });
              this.handleLogin(null, emailToken);
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  onBackPress = () => {
    this.props.navigation.goBack();
  };
}

let mapStateToProps = state => {
  return {
    countries: state.country.countries
  };
};

export default connect(mapStateToProps)(Login);
