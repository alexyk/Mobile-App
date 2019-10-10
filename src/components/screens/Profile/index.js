import {
  AsyncStorage,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { NavigationActions, StackActions } from "react-navigation";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Image from "react-native-remote-svg";
import Toast from "react-native-easy-toast";
import SingleSelectMaterialDialog from "../../atoms/MaterialDialog/SingleSelectMaterialDialog";
import ProfileWalletCard from "../../atoms/ProfileWalletCard";
import { setCurrency } from "../../../redux/action/Currency";
import styles from "./styles";
import { WALLET_STATE } from "../../../redux/enum";
import { BASIC_CURRENCY_LIST, OPTIONS } from "../../../config-settings";
import MessageDialog from "../../molecules/MessageDialog";
import DBG from "../../../config-debug";


class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: {},
      currencySelectionVisible: false
    };
  }

  componentDidMount() {
    if (__DEV__ && DBG.walletFlowDebug) {
      this.onFocus = this.props.navigation.addListener('didFocus', () => {
        this.showToast(`Debugging wallet flow is ON\nPressing create wallet button will guide you.\n(see walletCongratsDebug in config-debug)`);
      });
    }
  }

  componentWillUnmount() {
    if (__DEV__ && this.onFocus) {
      this.onFocus.remove();
    }
  }


  onCurrency = () => {
    this.setState({ currencySelectionVisible: true });
  };

  updateGender = gender => {
    this.setState({
      info: {
        ...this.state.info,
        gender: gender
      }
    });
  };

  logout = () => {
    const nestedNavigation = NavigationActions.navigate({
      routeName: "Welcome",
      action: NavigationActions.navigate({ routeName: "WELCOME_TRIPS" })
    });
    this.props.navigation.dispatch(nestedNavigation);

    let resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Welcome" })]
    });
    this.props.navigation.dispatch(resetAction);
    AsyncStorage.getAllKeys().then(keys => AsyncStorage.multiRemove(keys));
  };

  navigateToPaymentMethods = () => {
    this.props.navigation.navigate("PaymentMethods", {});
  };

  showToast = (msg, delayInMS=3000) => {
    this.refs.toast.show(msg, delayInMS);
  };

  onSendToken = () => {
    const { locBalance, ethBalance, walletState } = this.props.walletData;
    const { navigate } = this.props.navigation;

    switch (walletState) {
      case WALLET_STATE.NONE:
        this.showToast("Please create LOC wallet before sending token.");
        return;

      case WALLET_STATE.CONNECTION_ERROR:
      case WALLET_STATE.INVALID:
        this.showToast("There was an error while loading your wallet. Please try again later or contact support.");
        return;

      case WALLET_STATE.LOADING:
      case WALLET_STATE.CHECKING:
        this.showToast("Your LOC wallet is loading. Please wait until this process ends before sending tokens.");
        return;

      case WALLET_STATE.CREATING:
        this.showToast("Please wait for the process of creating your LOC wallet to be complete before sending token.");
        return;
    }

    navigate("SendToken", {
      locBalance: locBalance.toFixed(6),
      ethBalance: parseFloat(ethBalance).toFixed(6)
    });
  };

  _renderWallet(walletState) {
    return (
      <ProfileWalletCard
        navigation={this.props.navigation}
        createWallet={this.createWallet}
      />
    );
  }

  _renderSettings() {
    if (!OPTIONS.settings) {
      return null;
    }

    return (
      <TouchableOpacity
        onPress={() => this.props.navigation.navigate("Settings")}
        style={styles.navItem}
      >
        <Text style={styles.navItemText}>Search Settings</Text>
        <Image
          resizeMode="stretch"
          source={require("../../../assets/icons/settings.png")}
          style={styles.navIcon}
        />
      </TouchableOpacity>

    )
  }

  render() {
    const { currency, walletData, navigation } = this.props;
    const { walletState } = walletData;
    const { navigate } = navigation;

    //console.log("profile locAddress: ", locAddress);
    //console.log("profile currency: ", currency);

    return (
      <View style={styles.container}>
        <Toast
          ref="toast"
          style={{ backgroundColor: "#DA7B61" }}
          position="center"
          positionValue={100}
          fadeInDuration={500}
          fadeOutDuration={500}
          opacity={1.0}
          textStyle={{ color: "white", fontFamily: "FuturaStd-Light" }}
        />
        <ScrollView
          showsHorizontalScrollIndicator={false}
          style={{ width: "100%" }}
        >
          {this._renderWallet(walletState)}

          <View>
            {/* <TouchableOpacity
              onPress={() => navigate("SimpleUserProfile")}
              style={styles.navItem}
            >
              <Text style={styles.navItemText}>View Profile</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={() =>
                navigate("EditUserProfile", { updateGender: this.updateGender })
              }
              style={styles.navItem}
            >
              <Text style={styles.navItemText}>Edit Profile</Text>
              <Image
                resizeMode="stretch"
                source={require("../../../assets/png/Profile/icon-user.png")}
                style={styles.navIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigate("Notifications")}
              style={styles.navItem}
            >
              <Text style={styles.navItemText}>Notifications</Text>
              <Image
                resizeMode="stretch"
                source={require("../../../assets/png/Profile/icon-bell.png")}
                style={styles.navIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.navigateToPaymentMethods}
              style={styles.navItem}
            >
              <Text style={styles.navItemText}>Payment Methods</Text>
              <Image
                resizeMode="stretch"
                source={require("../../../assets/png/Profile/icon-payment.png")}
                style={styles.navIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onCurrency} style={styles.navItem}>
              <Text style={styles.navItemText}>Currency</Text>
              <Text style={styles.navCurrency}>{currency}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onSendToken} style={styles.navItem}>
              <Text style={styles.navItemText}>Send Tokens</Text>
              <Image
                resizeMode="stretch"
                source={require("../../../assets/png/Profile/icon-switch.png")}
                style={styles.navIcon}
              />
            </TouchableOpacity>

            { this._renderSettings() }

            <TouchableOpacity onPress={this.logout} style={styles.navItem}>
              <Text style={styles.navItemText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <SingleSelectMaterialDialog
          title={"Select Currency"}
          items={BASIC_CURRENCY_LIST.map((row, index) => ({
            value: index,
            label: row
          }))}
          selected={this.props.currency}
          visible={this.state.currencySelectionVisible}
          onCancel={() => this.setState({ currencySelectionVisible: false })}
          onOk={result => {
            //console.log("select country", result);
            this.setState({ currencySelectionVisible: false });
            this.props.setCurrency({ currency: result.selectedItem.label });
            // this.props.actions.getCurrency(result.selectedItem.label);
          }}
        />

        <MessageDialog {...this.props.messageDialog} />
      </View>
    );
  }
}

let mapStateToProps = state => {
  return {
    currency: state.currency.currency,
    currencySign: state.currency.currencySign,
    loginDetails: state.userInterface.loginDetails,
    walletData: state.userInterface.walletData,
    messageDialog: state.userInterface.messageDialog
  };
};

const mapDispatchToProps = dispatch => ({
  setCurrency: bindActionCreators(setCurrency, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
