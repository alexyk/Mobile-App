/**
 * Note:
 *     No need for function.bind(this) for render* functions (except for renderItem)
 *     There are several render* functions below not bound in constructor
 *     for this reason. The one bound - renderItem - is not called in render
 *     method, but it is called by the component UltimateListView.
 */

import { BackHandler, Platform, View, Text, TouchableOpacity } from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";
import WebView from "react-native-webview";

import styles from "./styles";

import { generateWebviewInitialState } from "../utils";
import DBG from "../../../config-debug";
import { rlog } from "../../../utils/debug/debug-tools";
import LTLoader from "../../molecules/LTLoader";
import TopBar from "../../molecules/TopBar";

// TODO: Clean and test - the implementation is not cleaned since migration from previous developers. Tests were not added when migrating
class WebviewScreen extends Component {
  useDelay = true; // set to false if isSimple - see constructor code

  webViewRef = {
    canGoBackAndroid: false,
    ref: null
  };

  constructor(props) {
    super(props);

    const { params } = props.navigation.state;
    const { simpleParams, useCachedSearchString, message } = params;
    const isSimple = simpleParams != null;

    const allParams = Object.assign({}, params, { currency: props.currency });
    const skipWebViewURL = params.useCachedSearchString || params.webViewURL;

    // set initial state
    if (isSimple) {
      WebviewScreen.useDelay = false;
      const { url, body, message: simpleMessage, injectJS, injectedJS } = simpleParams;
      this.state = {
        message: simpleMessage != null ? simpleMessage : "Loading ...",
        webViewUrl: url,
        body,
        injectJS,
        injectedJS
      };
    } else {
      this.state = generateWebviewInitialState(allParams, null, skipWebViewURL);
      this.state.message = message != null ? message : "Loading ...";
      if (useCachedSearchString) {
        this.state.webViewUrl = props.allState.userInterface.webViewURL;
      }
    }

    // extra state defaults
    this.state.history = 0;
    this.state.params = params;
    if (this.state.injectedJS == null) {
      // this.state.injectedJS = `
      // window.document.addEventListener('click', function (event) {
      //   window.ReactNativeWebView.postMessage("history++");
      // }, false);
      // `;
    }

    this.onBackPress = this.onBackPress.bind(this);
    this.onDebugPress = this.onDebugPress.bind(this);
    this.onForwardPress = this.onForwardPress.bind(this);
    this.onResultsPress = this.onResultsPress.bind(this);
    this.onSearchPress = this.onSearchPress.bind(this);
    this.onWebViewLoadStart = this.onWebViewLoadStart.bind(this);
    this.onWebViewLoadEnd = this.onWebViewLoadEnd.bind(this);
    this.onWebViewMessage = this.onWebViewMessage.bind(this);
    this.onWebViewNavigationState = this.onWebViewNavigationState.bind(this);

    this.showPageTimeout = 5; // how many seconds to wait for loading page
    this.timeout = null; // the timer id
  }

  componentWillMount() {
    if (Platform.OS == "android") {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
    }
  }

  componentDidMount() {
    if (this.useDelay) {
      this.showContentWithDelay(this.showPageTimeout);
    }
  }

  componentWillUnmount() {
    if (Platform.OS == "android") {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    }
  }

  showContentWithDelay(timeInSeconds) {
    let _this = this;
    const func = () => {
      if (_this) {
        _this.setState({ isLoading: false });
      }
    };
    clearTimeout(this.timeout);
    this.timeout = setTimeout(func, timeInSeconds * 1000);
  }

  onSearchPress(event) {
    // this.props.navigation.goBack();
  }

  onResultsPress(event) {
    if (this.state.canGoToResults) {
      // this.webViewRef.ref.goBack();

      this.webViewRef.canGoBackAndroid = false;
      this.setState({
        canGoBack: false,
        canGoForward: true,
        canGoToResults: false
      });
    }
  }

  onDebugPress(event) {
    const func = () => this.webViewRef.ref.reload();
    setTimeout(func, 100);
  }

  onBackPress(event) {
    let { history } = this.state;

    if (history > 0 && this && this.webViewRef.ref) {
      this.webViewRef.ref.goBack();
      history--;
      rlog("history", `Setting Webview history to ${history} (was ${this.state.history})`);
      this.setState({ history });
    } else {
      this.props.navigation.goBack();
    }

    if (Platform.OS == "android") {
      return true;
    }
  }

  onForwardPress(event) {
    if (this.state.canGoForward) {
      this.webViewRef.ref.goForward();
    }
  }

  onWebViewLoadStart(event) {
    rlog("weview-load-end", `onLoadEnd from webview`, { event });

    this.setState({
      canGoToResults: true
    });
  }

  onWebViewMessage(event) {
    const { data, canGoBack, canGoForward } = event.nativeEvent;
    rlog("weview-message", `${data}`, { title: "onWebviewMessage", event, canGoBack, canGoForward });

    // Default cases of HTML/JS to Native communication
    // See also - injectedJS in constructor and onBackPress
    let newValue = this.state.history;
    switch (data) {
      case "history++":
        newValue++;
        break;
        
      case "history--":
        newValue--;
        break;
    }

    rlog("history", `Setting Webview history to ${newValue} (was ${this.state.history})`);
    this.setState({ history: newValue });
  }

  onWebViewLoadEnd(event) {
    const target = event.target;
    const { nativeEvent } = target;

    rlog("weview-load-end", `onLoadEnd from webview`, { event, nativeEvent, target });

    if (this.useDelay) {
      if (this.state.isLoading) {
        this.showContentWithDelay(0.3);
      }
    } else {
      this.setState({ isLoading: false });
    }
  }

  onWebViewNavigationState(navState) {
    const { navigationType, url, canGoBack, canGoForward } = navState;
    rlog("weview-navigation", navigationType ? `${navigationType} -> ${url}` : "n/a", { navState });

    this.webViewRef.canGoBackAndroid = canGoBack;
    this.setState({ canGoForward, canGoBack });
  }

  _renderDebug() {
    if (!__DEV__ || !DBG.webviewDebugEnabled) {
      // webview debug disabled in these cases
      return null;
    }

    if (this.webViewRef.ref == null) {
      return null;
    }

    return (
      <TouchableOpacity key={"webview-debug"} onPress={this.onDebugPress}>
        <View style={{ backgroundColor: "#777A", width: 130, borderRadius: 5 }}>
          <Text style={{ textAlign: "center" }}>{"RELOAD WEBVIEW"}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const { isLoading, message, webViewUrl, body, injectJS, injectedJS } = this.state;
    const { backText, rightText, onRightPress } = this.state.params; // navigation params

    if (injectJS && this.webViewRef.ref) {
      setTimeout(() => this && this.webViewRef.ref && this.webViewRef.ref.injectJavaScript(injectJS), 300);
    }

    return (
      <View style={styles.container}>
        <TopBar
          onBackPress={this.onBackPress}
          backText={backText}
          onRightPress={onRightPress}
          rightText={rightText}
          extraItems={[this._renderDebug()]}
        />

        <View style={styles.webviewContainer}>
          <WebView
            scalesPageToFit={true}
            javaScriptEnabled={true}
            javaScriptEnabledAndroid={true}
            ref={webViewRef => (this.webViewRef.ref = webViewRef)}
            onNavigationStateChange={this.onWebViewNavigationState}
            onLoadStart={this.onWebViewLoadStart}
            onLoadEnd={this.onWebViewLoadEnd}
            onMessage={this.onWebViewMessage}
            style={styles.webView}
            injectedJavaScript={injectedJS}
            source={body ? { html: body } : { uri: webViewUrl }}
          />
        </View>

        <LTLoader isLoading={isLoading} message={message} opacity={"FA"} style={{ height: "89%", top: "11%" }} />
      </View>
    );
  }
}

let mapStateToProps = state => {
  return {
    currency: state.currency.currency,
    allState: state
  };
};
export default connect(
  mapStateToProps,
  null
)(WebviewScreen);
