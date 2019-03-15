/**
 * Note:
 *     No need for function.bind(this) for render* functions (except for renderItem)
 *     There are several render* functions below not binded in constructor
 *     for this reason. The one binded - renderItem - is not called in render
 *     method, but it is called by the component UltimateListView.
 */

import { 
    BackHandler, Platform, View, WebView
} from 'react-native';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import BackButton from '../../atoms/BackButton';
import styles from './styles';
import ProgressDialog from '../../atoms/SimpleDialogs/ProgressDialog';

import { basePath } from '../../../config'
import { generateWebviewUrl } from '../utils';

class WebviewScreen extends Component {
    iconSize = 30;

    webViewRef = {
        canGoBackAndroid: false,
        ref: null,
    };

    debug = () => {
        return require('moment')().format('HH:MM:SS')
    }
    
    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        console.log(`[${this.debug()}]### [WebviewScreen] Constructor `, {params});

        // TODO: Figure out what is this for and how was it supposed to work  / commented on by Alex K, 2019-03-06
        // UUIDGenerator.getRandomUUID((uuid) => {
        //     uid = uuid;
        // }); 
        console.disableYellowBox = true;

        const checkInDateFormated   = params ? params.checkInDateFormated  : '';
        const checkOutDateFormated  = params ? params.checkOutDateFormated  : '';
        const roomsDummyData        = params ? params.roomsDummyData : [];
        const regionId              = params ? params.regionId : 0;

        const initialState = {
            guests:             params ? params.guests          : 0,
            isHotelSelected:    params ? params.isHotelSelected : false,
            countryId:          params ? params.countryId       : 0,
            regionId,
            checkInDateFormated,
            checkOutDateFormated,
            roomsDummyData,
            email:  params? params.email : '',
            token:  params? params.token : '',
            propertyName:  params? params.propertyName : '',
            buttonBarEnabled: false,
            canGoBack: false,
            canGoForward: false,
            canGoToResults: false,
            showProgress: true
        }

        const webViewUrl = basePath + generateWebviewUrl(
            initialState,
            roomsDummyData,
            (params && params.baseUrl)
                ? params.baseUrl
                : null
        );

        this.state = {
            ...initialState,
            webViewUrl
        }

        // Fix for using WebView::onMessage
        this.patchPostMessageFunction = function() {
            
            var originalPostMessage = window.postMessage;
          
            var patchedPostMessage = function(message, targetOrigin, transfer) { 
                console.log('Patched', {message,targetOrigin,transfer});
                
                originalPostMessage(message, targetOrigin, transfer);
            };
          
            patchedPostMessage.toString = function() { 
              return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
            };
            
            window.postMessage = patchedPostMessage;
        };

        this.onBackPress = this.onBackPress.bind(this);
        this.onForwardPress = this.onForwardPress.bind(this);
        this.onResultsPress = this.onResultsPress.bind(this);
        this.onSearchPress = this.onSearchPress.bind(this);
        this.onWebViewLoadStart = this.onWebViewLoadStart.bind(this);
        this.onWebViewLoadEnd = this.onWebViewLoadEnd.bind(this);
        this.onWebViewMessage = this.onWebViewMessage.bind(this);
        this.onWebViewNavigationState = this.onWebViewNavigationState.bind(this);
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress');
        }
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

    onBackPress(event) {
        console.log('[WebviewScreen] back', {wview:this.webViewRef, event});

        // if (this.state.canGoBack) {
        //     this.webViewRef.ref.goBack();
        //     this.setState({canGoForward:true})
        // }

        this.props.navigation.goBack();
    }

    onForwardPress(event) {
        console.log('[WebviewScreen] forward', {wview:this.webViewRef, event});
    
        if (this.state.canGoForward) {
            this.webViewRef.ref.goForward();
        }
    }


    onWebViewLoadStart(event) {
        console.log(`[${this.debug()}] WebView::onLoadStart`,
            {source: this.state.webViewUrl,wview:this.webViewRef,state:this.state});

        this.setState({
            buttonBarEnabled: false,
            canGoToResults: true
        })
    }
    
    onWebViewMessage(event) {
        console.log(`[${this.debug()}] WebView::onMessage`,
            {source: this.state.webViewUrl,wview:this.webViewRef,state:this.state,event});
    }

    onWebViewLoadEnd(event) {
        console.log(`[${this.debug()}] WebView::onLoadEnd`,{wview:this.webViewRef});
        this.setState({
            showProgress: false,
            buttonBarEnabled: true
        })
    }

    onWebViewNavigationState(navState) {
        console.log(`[${this.debug()}] WebView::onNavigationState`,
              {url:String(navState.url).substr(0,60),forw:navState.canGoForward,["back/res"]:navState.canGoBack}, navState);

        this.webViewRef.canGoBackAndroid = navState.canGoBack;
        this.setState({canGoForward:    navState.canGoForward});

        // Page Name (flow step)    Url
        //------------------------  -----------------------------------------------------
        // 1) results               ...locktrip.com/mobile/listings?...
        // 2) hotel details         ...locktrip.com/mobile/listings/<hotel-id>...
        // 3) booking               (same as 2) - maybe it needs WebApp work to show??? // Alex K, 2019-03-06)
            // page/flow-step 2 for "Results" button enabled
        this.setState({canGoToResults:  String(navState.url).match(/listings\//)}); 
            // page/flow-step 2 for "Results" button enabled
        this.setState({canGoBack:       String(navState.url).match(/listings\/[0-9]/)});
        // this.setState({canGoBack:       navState.canGoBack});

        // console.log(`[${this.debug()}]@##@ onNavigationState`,{navState})
    }

    onAndroidBackPress = () => {
        this.props.navigation.goBack();

        /*
        if (this.webViewRef.canGoBackAndroid && this.webViewRef.ref) {
            this.webViewRef.ref.goBack();
            this.setState({canGoForward:true})
            return true;
        } else if (!this.webViewRef.canGoBackAndroid && this.webViewRef.ref) {
        }*/

        return false;
    }

    render() {
        const patchPostMessageJsCode = '(' + String(this.patchPostMessageFunction) + ')();';

        return (
            <View style={styles.container}>
                <BackButton onPress={this.onBackPress}/>

                <View style={styles.content}>
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

                <ProgressDialog
                   visible={this.state.showProgress}
                   title="Loading"
                   message={`Getting details for: \n'${this.state.propertyName}'`}
                   animationType="slide"
                   activityIndicatorSize="large"
                   activityIndicatorColor="black"/>
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
