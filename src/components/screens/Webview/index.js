/**
 * Note:
 *     No need for function.bind(this) for render* functions (except for renderItem)
 *     There are several render* functions below not binded in constructor
 *     for this reason. The one binded - renderItem - is not called in render
 *     method, but it is called by the component UltimateListView.
 */

import { 
    BackHandler, Platform, View, Text, TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import WebView from "react-native-webview";

import styles from './styles';

import lang from '../../../language';
import { generateWebviewInitialState } from '../utils';
import { webviewDebugEnabled } from '../../../config-debug';
import LTLoader from '../../molecules/LTLoader';
import TopBar from '../../molecules/TopBar';


class WebviewScreen extends Component {
    useDelay = true;

    webViewRef = {
        canGoBackAndroid: false,
        ref: null,
    };

    // TODO: Remove this @@debug START
    debug = () => {
        return require('moment')().format('hh:mm:ss')
    }
    // TODO: Remove this @@debug END
    
    constructor(props) {
        super(props);
        const { params } = props.navigation.state;

        // TODO: Figure out what is this for and how was it supposed to work  / commented on by Alex K, 2019-03-06
        // UUIDGenerator.getRandomUUID((uuid) => {
        //     uid = uuid;
        // }); 
        console.disableYellowBox = true;

        const allParams = Object.assign({},params,{currency:props.currency});
        const skipWebViewURL = ( params.useCachedSearchString || params.webViewURL );
        this.state = generateWebviewInitialState(allParams, null, skipWebViewURL);
        this.state.params = params;

        if (params.useCachedSearchString) {
            this.state.webViewUrl = props.allState.userInterface.webViewURL;
        }

        //rlog('webview', `Constructor`, {params, props})

        // Fix for using WebView::onMessage
        this.patchPostMessageFunction = function() {
            
            var originalPostMessage = window.postMessage;
          
            var patchedPostMessage = function(message, targetOrigin, transfer) { 
                //clog('Patched', `WebView post message`, {message,targetOrigin,transfer});
                
                originalPostMessage(message, targetOrigin, transfer);
            };
          
            patchedPostMessage.toString = function() { 
              return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
            };
            
            window.postMessage = patchedPostMessage;
        };

        this.onBackPress = this.onBackPress.bind(this);
        this.onDebugPress = this.onDebugPress.bind(this);
        this.onForwardPress = this.onForwardPress.bind(this);
        this.onResultsPress = this.onResultsPress.bind(this);
        this.onSearchPress = this.onSearchPress.bind(this);
        this.onWebViewLoadStart = this.onWebViewLoadStart.bind(this);
        this.onWebViewLoadEnd = this.onWebViewLoadEnd.bind(this);
        this.onWebViewMessage = this.onWebViewMessage.bind(this);
        this.onWebViewNavigationState = this.onWebViewNavigationState.bind(this);

        this.showPageTimeout = 5;   // how many seconds to wait for loading page
        this.timeout = null;        // the timer id
    }

    componentWillMount() {
        if (Platform.OS == 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        }
    }

    componentDidMount() {
        if (this.useDelay) {
            this.showContentWithDelay(this.showPageTimeout);
        }
    }
    

    componentWillUnmount() {
        if (Platform.OS == 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
        }
    }

    showContentWithDelay(timeInSeconds) {
        let _this = this;
        const func = () => {
            //console.log('[WebView] showContentWithDelay',_this)

            if (_this) {
                _this.setState({isLoading: false});
            }
        }
        clearTimeout(this.timeout);
        this.timeout = setTimeout(
            func,
            timeInSeconds * 1000,
        );
    }

    onSearchPress(event) {
        // this.props.navigation.goBack();
    }

    onResultsPress(event) {
        if (this.state.canGoToResults) {
            // this.webViewRef.ref.goBack();
            // this.webViewRef.ref.goBack();
            // this.webViewRef.ref.goBack();
            this.webViewRef.canGoBackAndroid = false;
            this.setState({canGoBack: false});
            this.setState({canGoForward: true});
            this.setState({canGoToResults: false});
        }
    }

    onDebugPress(event) {
        const func = () => this.webViewRef.ref.reload();
        setTimeout(func,100);
    }

    onBackPress(event) {
        //console.log('[WebviewScreen] back', {wview:this.webViewRef, event});

        // if (this.state.canGoBack) {
        //     this.webViewRef.ref.goBack();
        //     this.setState({canGoForward:true})
        // } else {
            this.props.navigation.goBack();
        // }

        if (Platform.OS == 'android') {
            return true;
        }
    }

    onForwardPress(event) {
        //console.log('[WebviewScreen] forward', {wview:this.webViewRef, event});
    
        if (this.state.canGoForward) {
            this.webViewRef.ref.goForward();
        }
    }

    onWebViewLoadStart(event) {
        /** console.log(`[${this.debug()}] %c WebView::onLoadStart %c`,
            // {source: this.state.webViewUrl,wview:this.webViewRef,state:this.state},
            // 'background: #899; color: #F55; font-weight: bold',
            'color: #F55; font-weight: bold',
            'background: #FFF; color: #000',
        );
        */

        this.setState({
            canGoToResults: true
        })
    }
    
    onWebViewMessage(event) {
        //console.log(`[${this.debug()}] WebView::onMessage`,
            // {source: this.state.webViewUrl,wview:this.webViewRef,state:this.state,event},
        // );
    }

    onWebViewLoadEnd(event) {
        const target = event.target;
        const ev = target.nativeEvent;

        /*console.log(`[${this.debug()}] %c WebView::onLoadEnd %c `+
            ((ev != null)
                ? (
                    `url:${ev ? ev.url.substr(29,40) : 'n/a'}` +
                    `back:${ev.canGoBack}` +
                    `for:${ev.canGoForward}` +
                    `loaging:${ev.loading}` +
                    `target:${ev.target}`
                  )
                : ''
            ),
            // {wview:this.webViewRef},
            // 'background: #757; color: #0F0; font-weight: bold',
            'color: #0A0; font-weight: bold',
            'background: #FFF; color: #000',
        );*/

        if (this.useDelay) {
            if (this.state.isLoading) {
                this.showContentWithDelay(0.3);
            }
        } else {
            this.setState({isLoading:false})
        }
    }

    onWebViewNavigationState(navState) {
        // clog('webview',`[NavigationEvent] url: ${this.webViewRef.ref.url}`,{navState,ref:this.webViewRef.ref, className:this.webViewRef.ref.constructor ? this.webViewRef.ref.constructor.name : 'n/a'});

        this.webViewRef.canGoBackAndroid = navState.canGoBack;
        this.setState({canGoForward:    navState.canGoForward});


        const urlIsItemDetails = String(navState.url).match(/listings\/[0-9]/)
        const urlIsSearchResults = String(navState.url).match(/listings\//)

        // Page Name (flow step)    Url
        //------------------------  -----------------------------------------------------
        // 1) results               ...locktrip.com/mobile/listings?...
        // 2) hotel details         ...locktrip.com/mobile/listings/<hotel-id>...
        // 3) booking               (same as 2) - maybe it needs WebApp work to show??? // Alex K, 2019-03-06)
            // page/flow-step 2 for "Results" button enabled
        this.setState({canGoToResults:  urlIsSearchResults}); 
            // page/flow-step 2 for "Results" button enabled
        this.setState({canGoBack:       urlIsItemDetails});
        // this.setState({canGoBack:       navState.canGoBack});

        const title = (urlIsSearchResults
            ? (this.state.isHotel 
                    ? lang.TEXT.SEARCH_HOTEL_RESULTS_TILE
                    : lang.TEXT.SEARCH_HOME_RESULTS_TILE
            )
            : (this.state.isHotel 
                    ? lang.TEXT.SEARCH_HOTEL_DETAILS_TILE
                    : lang.TEXT.SEARCH_HOME_DETAILS_TILE
            )
        );

        // console.log(`[${this.debug()}]@##@ onNavigationState`,{navState})
    }


    _renderDebug() {
       if (!__DEV__ || !webviewDebugEnabled) {
            // webview debug disabled in these cases
            return null;
        }
        
        if (this.webViewRef.ref == null) {
            //wlog('[WebView::renderDebug] this.webViewRef.ref is not set - not showing debug button')
            return null;
        }

        return (
            <TouchableOpacity key={'webview-debug'} onPress={this.onDebugPress}>
                <View style={{backgroundColor: '#777A', width: 130, borderRadius: 5}}>
                    <Text style={{textAlign: 'center'}}>{"RELOAD WEBVIEW"}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        const patchPostMessageJsCode = '(' + String(this.patchPostMessageFunction) + ')();';
        const { isLoading, message, propertyName } = this.state;
        const { backText, rightText, onRightPress } = this.state.params; // navigation params
        const loaderText = (message != null ? message : `Getting details for: \n'${propertyName}'`)

        console.log(`### [WebView] Rendering '${this.state.webViewUrl}'`)

        return (
            <View style={styles.container}>
                
                <TopBar onBackPress={this.onBackPress} backText={backText} onRightPress={onRightPress} rightText={rightText}  extraItems={[this._renderDebug()]} />

                <View style={styles.webviewContainer}>
                    <WebView
                        ref={(webViewRef) => { this.webViewRef.ref = webViewRef; }}
                        onNavigationStateChange = {this.onWebViewNavigationState}
                        onLoadStart = {this.onWebViewLoadStart}
                        onLoadEnd   = {this.onWebViewLoadEnd}
                        onMessage   = {this.onWebViewMessage}
                        style       = {styles.webView}
                        injectedJavaScript = {patchPostMessageJsCode}
                        source = {{ uri: this.state.webViewUrl }}
                        // javaScriptEnabled={true}
                    />
                </View>

                <LTLoader isLoading={isLoading} message={loaderText} opacity={'00'} style={{height:'90%', top:'15%'}} />
            </View>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        allState: state
    };
}
export default connect(mapStateToProps, null)(WebviewScreen);
