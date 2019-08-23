import { AsyncStorage, Text, View, StatusBar, Linking } from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";

import Button from "../../atoms/Button";
import GetStartedImage from "../../atoms/GetStartedImage";
import Image from "react-native-remote-svg";
import SplashPNG from "../../../assets/png/locktrip_logo.png";
import { domainPrefix, basePath } from "../../../config";
import requester from "../../../initDependencies";
import styles from "./styles";
import LoginLocationDialog from "../../atoms/LoginLocationDialog";
import VersionText from "../../atoms/VersionText";

import SplashScreen from "react-native-smart-splash-screen";
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager
} from "react-native-fbsdk";
import LTLoader from "../../molecules/LTLoader";
import { serverRequest, SERVER_ERROR } from "../../../services/utilities/serverUtils";

class Welcome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showProgress: false,
      locationDialogVisible: false,
      message: ""
    };

    this.doLoginViaFb = this.doLoginViaFb.bind(this);
    this.tryLogin = this.tryLogin.bind(this);
    this.tryRegister = this.tryRegister.bind(this);
    this.gotoFB = this.gotoFB.bind(this);
    this.gotoLogin = this.gotoLogin.bind(this);
    this.gotoRecover = this.gotoRecover.bind(this);
    this.gotoSignup = this.gotoSignup.bind(this);
  }

  componentDidMount() {
    SplashScreen.close({
      animationType: SplashScreen.animationType.scale,
      duration: 0,
      delay: 100
    });
  }

  tryLogin(countryID = null) {
    const _this = this;

    this.setState({ showProgress: true });

    const { id, email, accessToken } = this.fbInfo;
    if (email != null) {
      // TODO: Finish FB login here when BE implementation ready
      const user = {
        authId: id,
        email,
        password: id + "!a123",
        authProvider: `facebook,${accessToken}`
      };

      if (countryID != null) {
        user.country = countryID;
      }

      serverRequest(
        this,
        requester.login,
        [user],
        this.onFBLoginSuccess,
        this.onFBLoginError
      );
    } else {
      const user = {
        authId: "fid" + this.fbInfo.id,
        password: this.fbInfo.id + "!a123",
        authProvider: "facebook"
      };
      if (countryID != null) {
        user.country = countryID;
      }

      serverRequest(
        this,
        requester.login,
        [[user, null]],
        this.onLoginSuccess,
        this.onLoginError
      );
    }
  }

  tryRegister() {
    if (this.fbInfo.email) {
      requester.getEmailFreeResponse(this.fbInfo.email).then(res => {
        res.body.then(data => {
          if (data.exist) {
            // Toast.showWithGravity('Already exist email, please try with another email.', Toast.SHORT, Toast.BOTTOM);
            alert("Already exist email, please try with another email.");
          } else {
            this.props.navigation.navigate("CreateAccount", {
              firstName: this.fbInfo.first_name,
              lastName: this.fbInfo.last_name,
              email: this.fbInfo.email,
              userWantsPromo: true,
              password: this.fbInfo.id + "!a123",
              authId: "fid" + this.fbInfo.id,
              authProvider: "facebook"
            });
          }
        });
      });
    } else {
      this.props.navigation.navigate("CreateAccount", {
        firstName: this.fbInfo.first_name,
        lastName: this.fbInfo.last_name,
        email: "",
        userWantsPromo: true,
        password: this.fbInfo.id + "!a123",
        authId: "fid" + this.fbInfo.id,
        authProvider: "facebook"
      });
    }
  }

  doLoginViaFb(data) {
    const { accessToken } = data;
    const _this = this;
    const responseInfoCallback = function(error, result) {
      if (error) {
        this.setState({ message: "" });
        alert("Error while trying to connect with Facebook account");
        console.warn(`[Welcome] ` + error.message, error);
      } else {
        _this.fbInfo = {
          ...result,
          accessToken
        };
        _this.tryLogin();
      }
    };

    const infoRequest = new GraphRequest(
      "/me",
      {
        accessToken,
        parameters: {
          fields: {
            string: "email,name,first_name,last_name,picture"
          }
        }
      },
      responseInfoCallback
    );
    // Start the graph request.
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  gotoFB() {
    const _this = this;

    this.setState({ message: "Attempting log in with Facebook" });

    LoginManager.logInWithPermissions(["public_profile", "email"])
      .then(
        result => {
          if (result.isCancelled) {
            this.setState({ message: "" });
          } else {
            AccessToken.getCurrentAccessToken()
              .then(data => {
                _this.doLoginViaFb(data);
              })
              .catch(function(error) {
                this.setState({ message: "" });
                console.warn(`error while getting access token`, error);
              });
          }
        },
        error => {
          this.setState({ message: "" });
          alert("Login fail with error: " + error);
        }
      )
      .catch(function(error) {
        this.setState({ message: "" });
        console.log("error with facebook login", error);
      });
  }

  gotoLogin() {
    this.props.navigation.navigate("Login");
  }

  gotoSignup() {
    this.props.navigation.navigate("CreateAccount");
  }

  gotoRecover() {
    // TODO: Move this to a native version - two calls: (1) send e-mail, (2) send token from e-mail
    Linking.openURL(`${basePath}recover`);
  }

  onFBLoginSuccess() {
    this.setState({ message: "" });

    res.body.then(data => {
      AsyncStorage.setItem(`${domainPrefix}.auth.locktrip`, data.Authorization);
      // TODO: Get first name + last name from response included with Authorization token (Backend)
      AsyncStorage.setItem(`${domainPrefix}.auth.username`, email);
      _this.props.navigation.navigate("MainScreen");
    });
  }

  onFBLoginError(data, errorCode) {
    this.setState({ message: "", showProgress: false });

    switch (errorCode) {

      case SERVER_ERROR.LEVEL_3_FROM_SERVER:
        const { errors } = data;
        if (errors && errors.hasOwnProperty("CountryNull")) {
          _this.setState({ locationDialogVisible: true });
        } else if (errors && errors.hasOwnProperty("IncorrectPassword")) {
          const { email } = this.fbInfo;
          if (email != null) {
            this.props.navigation.navigate("Login", { email });
          }
        } else {
          this.tryRegister();
        }
        break;

      default:
        alert("Cannot login. Please check network connection.");
        break;

    }
  }

  onLoginSuccess(data) {
    this.setState({ showProgress: false });
    AsyncStorage.setItem(`${domainPrefix}.auth.locktrip`, data.Authorization);
    // // TODO: Get first name + last name from response included with Authorization token (Backend)
    // AsyncStorage.setItem(`${domainPrefix}.auth.username`, fbInfo.email);
    this.props.navigation.navigate("MainScreen");
  }

  onLoginError(data) {
    const { errors } = data;

    if (errors.hasOwnProperty("CountryNull")) {
      this.setState({ locationDialogVisible: true });
    } else {
      let keys = Object.keys(errors);
      let keysNoF = keys.filter(item => typeof item !== "function");

      if (keysNoF.includes("IncorrectPassword")) {
        // prettier-ignore
        alert("You already registered using email, so please try to login using email.");
      } else {
        this.tryRegister();
      }
    }
  }

  _renderButtons() {
    return (
      <View style={styles.buttonCollectionWrap}>
        <Button
          onPress={this.gotoLogin}
          text="Log In"
          wrapStyle={styles.logInButton}
        />
        <Button
          wrapStyle={styles.facebookButton}
          text="Continue with Facebook"
          onPress={this.gotoFB}
        />
        <Button
          wrapStyle={styles.createAccountButton}
          onPress={this.gotoSignup}
          text="Create an Account"
        />
        <Button
          wrapStyle={styles.recoverButton}
          onPress={this.gotoRecover}
          text="Recover"
        />
      </View>
    );
  }

  render() {
    const { countries } = this.props;
    const { showProgress, locationDialogVisible, message } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor="rgba(0,0,0,0)"
          translucent
          barStyle="light-content"
        />
        <Image
          source={SplashPNG}
          resizeMode="contain"
          style={styles.splashImage}
        />
        <Text style={styles.titleText}>Welcome</Text>

        {this._renderButtons()}

        <Text style={styles.finePrintText}>
          By tapping Log In, Continue or Create Account, I agree to LockChain's
          Terms of Service, Payments Terms of Service and Privacy Policy.
        </Text>

        <GetStartedImage />

        <VersionText
          color={"white"}
          size={10}
          style={{ bottom: "11%", position: "absolute" }}
          textStyle={{ marginHorizontal: 30 }}
        />

        <LoginLocationDialog
          countries={countries}
          title={"Select Currency"}
          visible={locationDialogVisible}
          okLabel={"OK"}
          onOk={countryID => {
            //console.log("select country", countryID);
            this.setState({ locationDialogVisible: false });
            this.tryLogin(countryID);
          }}
        />

        <LTLoader isLoading={showProgress} message={message} />
      </View>
    );
  }
}

let mapStateToProps = state => {
  return {
    countries: state.country.countries
  };
};

export default connect(mapStateToProps)(Welcome);
