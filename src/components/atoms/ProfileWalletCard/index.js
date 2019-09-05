import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import lodash from "lodash";

import { View, Text, TouchableOpacity, Clipboard } from "react-native";
import Image from "react-native-remote-svg";
import PropTypes from "prop-types";
import VersionText from "../../atoms/VersionText";
import Toast from "react-native-easy-toast"; //eslint-disable-line
import LTIcon from "../LTIcon";
import LTSmallLoader from "..//LTSmallLoader";
import styles, { walletBoxHeight } from "./styles";

import { WALLET_STATE } from "../../../redux/enum";
import { WALLET_REFRESH_TIMEOUT } from "../../../config-settings";
import { setWalletData } from "../../../redux/action/userInterface";
import { validateLOCAddress } from "../../../utils/validation";
import { Wallet } from "../../../services/blockchain/wallet";
import { CurrencyConverter } from "../../../services/utilities/currencyConverter";
import requester from "../../../initDependencies";
import { isNumber } from "../../screens/utils";
import { isOnline } from "../../../config-debug";

const DEFAULT_CRYPTO_CURRENCY = "EUR";

// TODO: Finish wallet refreshing (see this._isWalletTimeoutEnabled usage)
// Currently refreshed when switching to this tab 'Profile' from bottom navigation bar
// NOTE: Messages for wallet refreshing, creating etc. were added, but are currently disabled
// to go through reviewing and polishing
class ProfileWalletCard extends Component {
  constructor(props) {
    super(props);

    this._isWalletTimeoutEnabled = false;
    this._refreshId = -1;
    this._tempBalance = {}; // used for quick reference avoiding effects of cache being async
    this._message = null;

    this.createWallet = this.createWallet.bind(this);
    this.refreshWalletFromServer = this.refreshWalletFromServer.bind(this);
    this.processWalletError = this.processWalletError.bind(this);
    this.refreshWalletBalance = this.refreshWalletBalance.bind(this);
  }

  componentWillUnmount() {
    this.stopRefreshWalletTimer();

    // Now remove listeners here
    this.listListener.forEach(item => item.remove());
  }

  componentDidMount() {
    this.listListener = [
      this.props.navigation.addListener("didFocus", () => {
        this.refreshWalletFromServer();
        if (this._isWalletTimeoutEnabled) {
          this.startRefreshWalletTimer();
        }
      }),
      this.props.navigation.addListener("willBlur", () => {
        this.stopRefreshWalletTimer();
      })
    ];
  }

  processWalletError(error) {
    this.props.setWalletData({
      walletState: WALLET_STATE.CONNECTION_ERROR,
      caller: "ProfileWalletCard: case 8 - error"
    });
  }

  refreshWalletFromServer(callback = null) {
    // Skip asking for wallet address if already loaded
    // Directly refresh balance instead
    const { locAddress } = this.props.loginDetails;
    const { isFirstLoading, skipLOCAddressRequest } = this.props.walletData;
    if (
      (!isFirstLoading || skipLOCAddressRequest) &&
      validateLOCAddress(locAddress) == 1
    ) {
      this.props.setWalletData({
        walletState: WALLET_STATE.LOADING,
        caller: "ProfileWalletCard: case 1 - loading (short)"
      });
      this.refreshWalletBalance();
      return;
    }

    this.props.setWalletData({
      walletState: WALLET_STATE.CHECKING,
      caller: "ProfileWalletCard: case 2 - checking"
    });

    requester
      .getUserInfo()
      .then(res => {
        if (res && res.body) {
          res.body
            .then(data => {
              const { locAddress } = data;
              const locAddressValidationResult = validateLOCAddress(locAddress);

              switch (locAddressValidationResult) {
                case -1:
                  this.props.setWalletData({
                    locAddress,
                    walletState: WALLET_STATE.NONE,
                    caller: "ProfileWalletCard: case 3 - none"
                  });
                  break;

                case 0:
                  this.props.setWalletData({
                    locAddress,
                    walletState: WALLET_STATE.INVALID,
                    caller: "ProfileWalletCard: case 4 - invalid"
                  });
                  break;

                case 1:
                  this.props.setWalletData({
                    locAddress,
                    walletState: WALLET_STATE.LOADING,
                    caller: "ProfileWalletCard: case 5 - loading"
                  });
                  this.refreshWalletBalance(false, locAddress);
                  break;
              }

              if (callback != null) {
                callback(locAddressValidationResult);
              }
            })
            .catch(error => this.processWalletError(error));
        } else {
          this.processWalletError();
        }
      })
      .catch(error => this.processWalletError(error));
  }

  refreshWalletBalance(changeState = false, locAddress = null) {
    if (changeState)
      this.props.setWalletData({
        walletState: WALLET_STATE.LOADING,
        caller: "ProfileWalletCard: case 6 - loading"
      });

    if (locAddress == null) locAddress = this.props.loginDetails.locAddress;
    this._tempBalance = {};

    const addressValidationResult = validateLOCAddress(locAddress);

    if (addressValidationResult == 1) {
      if (isOnline) {
        Wallet.getBalance(locAddress).then(x => {
          const ethBalance = x / Math.pow(10, 18);
          this.checkBalance({ ethBalance });
        });

        Wallet.getTokenBalance(locAddress).then(y => {
          const locBalance = y / Math.pow(10, 18);
          this.checkBalance({ locBalance });
        });
      } else {
        requester.getWalletFromEtherJS(data => {
          this.checkBalance(data);
        });
      }
    } else {
      console.warn(
        "[ProfileWalletCard] Trying to get balance when wallet is not ready",
        { addressValidationResult, locAddress }
      );
    }
  }

  checkBalance(newData) {
    lodash.merge(this._tempBalance, newData);

    const { locBalance, ethBalance } = this._tempBalance;

    if (isNumber(locBalance) && isNumber(ethBalance)) {
      this.props.setWalletData({
        ethBalance,
        locBalance,
        walletState: WALLET_STATE.READY,
        caller: "ProfileWalletCard: case 7 - ready"
      });
    }
  }

  startRefreshWalletTimer() {
    this._refreshId = setInterval(() => {
      this.refreshWalletFromServer();
    }, WALLET_REFRESH_TIMEOUT * 1000);
  }

  stopRefreshWalletTimer() {
    if (this._refreshId != -1) {
      clearInterval(this._refreshId);
      this._refreshId = -1;
    }
  }

  createWallet() {
    const { navigate } = this.props.navigation;
    const callback = locAddressValidationResult => {
      if (locAddressValidationResult != 1) {
        navigate("CreateWallet");
      } else {
        this.refs.toast.show(
          "Your wallet was already created from another client.\nLoading it instead ...",
          3000
        );
      }
    };

    this.refreshWalletFromServer(callback);
  }

  _renderLogoBackground() {
    return (
      <Image
        source={require("../../../assets/splash.png")}
        style={styles.logoBackground}
      />
    );
  }

  _renderLogo() {
    return (
      <Image
        source={require("../../../assets/splash.png")}
        style={styles.logo}
      />
    );
  }

  _renderMessage(message, isCard = false) {
    const renderedText = <Text style={styles.messageText}>{message}</Text>;

    if (isCard) {
      return this._renderEmptyBox(renderedText);
    } else {
      return renderedText;
    }
  }

  _renderEmptyBox(extraContent = null) {
    return (
      <View
        style={{
          width: "100%",
          height: walletBoxHeight,
          alignItems: "center",
          justifyContent: "flex-start",
          paddingBottom: 5
        }}
      >
        {this._renderLogo()}
        {this._renderLogoBackground()}
        {extraContent}
      </View>
    );
  }

  _renderAppVersion() {
    return (
      <VersionText
        color={"white"}
        size={9}
        style={{
          position: "absolute",
          backgroundColor: "transparent",
          top: 25,
          right: 10,
        }}
        textStyle={{ textAlign: "right" }}
      />
    );
  }

  _renderToast() {
    return (
      <Toast
        ref="toast"
        style={{ backgroundColor: "#DA7B61" }}
        position="center"
        positionValue={150}
        fadeInDuration={500}
        fadeOutDuration={500}
        opacity={1.0}
        textStyle={{ color: "white", fontFamily: "FuturaStd-Light" }}
      />
    );
  }

  _renderLocBalance(locBalance, displayPrice) {
    const validLocBalance = isNumber(locBalance);

    if (!validLocBalance) {
      return (
        <View style={{ width: "100%" }}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceText}> </Text>
        </View>
      );
    }

    return (
      <View style={{ width: "100%" }}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceText}>
          {locBalance.toFixed(6)} LOC / {displayPrice}
        </Text>
      </View>
    );
  }

  _renderEthBalance(ethBalance) {
    const validEthBalance = isNumber(ethBalance);

    if (!validEthBalance) {
      return (
        <View style={{ width: "100%" }}>
          <Text style={styles.balanceLabel}>ETH Balance</Text>
          <Text style={styles.balanceText}> </Text>
        </View>
      );
    }

    return (
      <View style={{ width: "100%" }}>
        <Text style={styles.balanceLabel}>ETH Balance</Text>
        <Text style={styles.balanceText}>
          {parseFloat(ethBalance).toFixed(6)}
        </Text>
      </View>
    );
  }

  _renderLocAddress(locAddress, isRenderingLocAddress) {
    return (
      <View style={{ width: "100%" }}>
        <Text style={styles.locAddress}>{`${
          isRenderingLocAddress ? locAddress : "..."
        }`}</Text>
      </View>
    );
  }

  _renderRefreshButtonOrLoader(isButton) {
    if (isButton) {
      return (
        <TouchableOpacity
          onPress={() => this.refreshWalletBalance(true)}
          style={styles.refreshButton}
        >
          <LTIcon size={16} name={"refresh"} style={{ color: "#FFF7" }} />
        </TouchableOpacity>
      );
    } else {
      return this._renderLoader(true);
    }
  }

  _renderWalletContent(isReloading, isEmpty, isReady, isLoading) {
    const { exchangeRates, locAmounts, currency, currencySign } = this.props;
    const { locAddress } = this.props.loginDetails;
    const { walletState, locBalance, ethBalance } = this.props.walletData;

    const fiat =
      exchangeRates.currencyExchangeRates &&
      CurrencyConverter.convert(
        exchangeRates.currencyExchangeRates,
        DEFAULT_CRYPTO_CURRENCY,
        currency,
        exchangeRates.locRateFiatAmount
      );
    let locAmount =
      locAmounts.locAmounts[exchangeRates.locRateFiatAmount] &&
      locAmounts.locAmounts[exchangeRates.locRateFiatAmount].locAmount;
    if (!locAmount) {
      locAmount = exchangeRates.locRateFiatAmount / exchangeRates.locEurRate;
    }
    const locRate = fiat / locAmount;
    const price = locBalance * locRate;
    let displayPrice = currencySign;
    if (locBalance == 0 || price != 0) {
      displayPrice += " " + price.toFixed(2);
    }

    let result = null;
    this._message = null;

    // first priority cases - lost connection / errors
    switch (walletState) {
      case WALLET_STATE.INVALID:
        result = this._renderMessage(
          "Error occurred while reading wallet data. Please report to support.",
          true
        );
        break;

      case WALLET_STATE.CONNECTION_ERROR:
        result = this._renderMessage(
          "Connection error while getting wallet ...",
          true
        );
        break;
    }

    // current design for more flexibility of wallet state visualisation
    //      this._message - setting it will eventually render message over content (uncomment the line in _renderLoader)
    //      result - intended to be used as content (WALLET_STATE.READY / LOADING) a replacement of content by using _renderEmptyBox with extraContent
    if (result == null) {
      // ui cases
      const uiState = isReloading ? WALLET_STATE.READY : walletState;
      result = this._renderEmptyBox();
      let skipRenderingWalletContent = false;

      switch (uiState) {
        case WALLET_STATE.NONE:
          result = this._renderMessage(
            `Please click the button to create your LOC Wallet!`,
            true
          );
          skipRenderingWalletContent = true;
          break;

        case WALLET_STATE.CREATING:
          result = this._renderMessage("Creating wallet ...", true);
          skipRenderingWalletContent = true;
          break;

        case WALLET_STATE.CHECKING:
          result = this._renderMessage("Checking for wallet ...", true);
          skipRenderingWalletContent = true;
          break;

        case WALLET_STATE.LOADING:
          this._message = this._renderMessage("Refreshing wallet data ...");
          break;
      }

      // This case was in the switch above - case WALLET_STATE.READY
      // but moving it here there is more flexibility
      if (!isEmpty && !skipRenderingWalletContent) {
        result = (
          <View style={{ height: walletBoxHeight }}>
            {this._renderLogo()}
            {this._renderLogoBackground()}

            {this._renderLocBalance(locBalance, displayPrice)}
            {this._renderEthBalance(ethBalance)}
            {this._renderLocAddress(locAddress, isReady || isLoading)}

            {this._renderRefreshButtonOrLoader(isReady)}
          </View>
        );
      }
    }

    return result;
  }

  _renderCreateWalletButton() {
    const { walletState } = this.props.walletData;
    const isButtonEnabled = walletState == WALLET_STATE.NONE;

    return (
      isButtonEnabled && (
        <TouchableOpacity
          onPress={this.createWallet}
          style={styles.createWallet}
        >
          <LTIcon size={24} name={"plus"} style={{ color: "#FFF7" }} />
        </TouchableOpacity>
      )
    );
  }

  _renderCopyButton(isShowingCopyButton) {
    if (!isShowingCopyButton) {
      return (
        <View style={styles.copyBox}>
          <Text style={styles.copyText}> </Text>
        </View>
      );
    }

    const { locAddress } = this.props.loginDetails;

    return (
      isShowingCopyButton && (
        <TouchableOpacity
          onPress={() => {
            Clipboard.setString(locAddress);
          }}
        >
          <View style={styles.copyBox}>
            <Text style={styles.copyText}>
              Copy your wallet address to clipboard
            </Text>
          </View>
        </TouchableOpacity>
      )
    );
  }

  _renderLoader(isShowingLoader) {
    return (
      isShowingLoader && (
        <View style={[styles.loaderBox]}>
          <LTSmallLoader size={"large"} />
          {/* { this._message != null && this._message } */}
        </View>
      )
    );
  }

  render() {
    const {
      isFirstLoading,
      skipLOCAddressRequest,
      walletState
    } = this.props.walletData;

    const isReady = walletState == WALLET_STATE.READY;
    const isLoading = walletState == WALLET_STATE.LOADING;
    const isEmpty =
      walletState == WALLET_STATE.NONE ||
      walletState == WALLET_STATE.CONNECTION_ERROR ||
      walletState == WALLET_STATE.INVALID;
    const isReloading = !isFirstLoading && !isReady && !isEmpty;

    return (
      <View>
        <View style={styles.cardBox}>
          {this._renderWalletContent(isReloading, isEmpty, isReady, isLoading)}

          {this._renderCreateWalletButton()}
        </View>

        {this._renderCopyButton(
          (isReloading || isReady || skipLOCAddressRequest) && !isEmpty
        )}

        {this._renderAppVersion()}
        {this._renderToast()}
      </View>
    );
  }
}

ProfileWalletCard.propTypes = {
  navigation: PropTypes.object
};

ProfileWalletCard.defaultProps = {
  navigation: null
};

const mapStateToProps = state => {
  return {
    currency: state.currency.currency,
    currencySign: state.currency.currencySign,

    locAmounts: state.locAmounts,
    exchangeRates: state.exchangeRates,

    loginDetails: state.userInterface.loginDetails,
    walletData: state.userInterface.walletData
  };
};

const mapDispatchToProps = dispatch => ({
  setWalletData: bindActionCreators(setWalletData, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileWalletCard);
