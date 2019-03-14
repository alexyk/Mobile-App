/**
 * Note:
 *     No need for function.bind(this) for render* functions
 *     There are several render* functions below not binded
 *     in constructor for this reason.
 */

import { 
    BackHandler, Platform, Text, View, WebView, TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';
import { connect } from 'react-redux';

// import BackButton from '../../atoms/BackButton';
import UUIDGenerator from 'react-native-uuid-generator';
import styles from './styles';
// import Icon from "react-native-vector-icons/SimpleLineIcons"
import IconAwesome from "react-native-vector-icons/FontAwesome"
// import IconMaterialCommunity from "react-native-vector-icons/MaterialCommunityIcons"
import ProgressDialog from '../../atoms/SimpleDialogs/ProgressDialog';

import { basePath } from '../../../config'

class Property extends Component {
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
        console.log(`[${this.debug()}]### [Property] Constructor `, {params});

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
            urlForService: 'region=' + regionId
            +'&currency=' + this.props.currency
            +'&startDate=' + checkInDateFormated
            +'&endDate=' + checkOutDateFormated
            +'&rooms=' + roomsDummyData,
            buttonBarEnabled: false,
            canGoBack: false,
            canGoForward: false,
            canGoToResults: false,
            showProgress: true
        }
        
        const webViewUrl = basePath + this.generateSearchUrl(
            initialState, 
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

    /**
     * @baseUrl (String) null if automatically generated
     */
    generateSearchUrl(initialState, baseUrl=null) {
        let result = baseUrl;
        const baseHomeUrl = 'homes/listings/?'
        const baseHotelUrl = 'mobile/hotels/listings?'
            
        if ( initialState.isHotelSelected ) {
            // hotels search
            if (!result) result = baseHotelUrl;
            initialState.urlForService = 'region='+initialState.regionId
                +'&currency='+this.props.currency
                +'&startDate='
                +initialState.checkInDateFormated
                +'&endDate='+initialState.checkOutDateFormated
                +'&rooms='+initialState.roomsDummyData;
            result += initialState.urlForService;
        } else {
            // homes search
            if (!result) result = baseHomeUrl;
            result += 'countryId=' + initialState.countryId
                     + '&startDate=' + initialState.checkInDateFormated
                     + '&endDate=' + initialState.checkOutDateFormated
                     + '&guests=' + initialState.guests
                     + '&priceMin=1&priceMax=5000'
                     + '&currency=' + this.props.currency
        }
        result += '&authEmail=' + initialState.email + '&authToken=' + initialState.token.replace(' ', '%20')

        return result;
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
        console.log('[Property] back', {wview:this.webViewRef, event});

        // if (this.state.canGoBack) {
        //     this.webViewRef.ref.goBack();
        //     this.setState({canGoForward:true})
        // }

        this.props.navigation.goBack();
    }

    onForwardPress(event) {
        console.log('[Property] forward', {wview:this.webViewRef, event});
    
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

    renderButton(type, layout, order) {
        /**
         * type   - see switch in body below ('filters', 'back', 'forward' ...)
         * layout - "top" or 'bottom'
         */
        let elements = [];
        let viewStyles = [];
        let enabledOpacity = true;
        let isSmall = false;

        switch (type) {

            case 'filters':
                elements = [
                    <IconAwesome key={"iconFilters"} name={"filter"} size={this.iconSize} />,
                    <Text style={styles.buttonText} key={"text"} >Filters</Text>
                ];
                viewStyles.push(
                        {
                            // backgroundColor:'yellow',
                            // alignSelf: 'center'
                        }
                );
                break;

            case 'back':
                elements = [
                    <IconAwesome key={"iconBack"} name={"arrow-left"} size={this.iconSize*4/5} onPress={this.onBackPress} />,
                    <Text style={styles.buttonTextSmall} key={"text"} >Back</Text>
                ];
                enabledOpacity = this.state.canGoBack;
                isSmall = true;
                viewStyles.push(
                    {
                        // backgroundColor:'yellow',
                        // alignSelf: 'center'
                        marginLeft: (order == 'simple') ? 20 : 0
                    }
                );
                break;

            case 'forward':
                enabledOpacity = this.state.canGoForward;
                elements = [
                    <IconAwesome key={"iconForward"} name={"arrow-right"} size={this.iconSize*4/5} onPress={this.onForwardPress} />,
                    <Text style={styles.buttonTextSmall} key={"text"}>Forward</Text>
                ];
                isSmall = true;
                viewStyles.push(
                    {
                        // backgroundColor:'yellow',
                        // alignSelf: 'center'
                        marginRight: ['android','mirror'].indexOf(order)>-1 ? 10 : 0
                    }
                );
                break;

            case 'map':
                elements = [
                    <IconAwesome key={"iconMap"} name="map" size={this.iconSize} />,
                    <Text key={"text"} style={styles.buttonText}>Map</Text>
                ];
                viewStyles.push(
                    {
                        // backgroundColor:'yellow',
                        // alignSelf: 'center'
                    }
                );
                break;

            case 'resultsORsearch':
                const isResults = this.state.canGoToResults;
                elements = (
                    isResults
                        ? [
                            <IconAwesome key={"iconResuts"} name="list" size={this.iconSize} onPress={this.onResultsPress} />,
                            <Text style={styles.buttonText} key={"text"}>Results</Text>
                        ]
                        : [
                            <IconAwesome key={"iconSearch"} name="search" size={this.iconSize} onPress={this.onSearchPress} />,
                            <Text style={styles.buttonText} key={"text"}>Search</Text>
                        ]
                );
                viewStyles.push(
                    {
                        // backgroundColor:'pink',
                        justifyContent:"center",
                        // borderColor: 'green',
                        width: 70
                    }
                );
                break;
        }

        // button text below or under buttons - if layout is top, text is bottom
        if (layout == 'bottom') elements.reverse();

        // button enabled - 100% opacity, else 10% opacity
        const opacityStyle = (
            ( this.state.buttonBarEnabled 
              && enabledOpacity
            )
                ? {opacity: 1}
                : {opacity: 0.1});
        viewStyles.push(opacityStyle);

        // container styles
        if (layout == 'top') {
            viewStyles.push(
                isSmall
                    ? styles.topBarButtonContainerSmall 
                    : styles.topBarButtonContainer
            );
        } else {
            viewStyles.push(
                isSmall
                    ? styles.bottomBarButtonContainerSmall
                    : styles.bottomBarButtonContainer
            );
        }

        // the result rendering
        return (
            <View key={type} style={viewStyles}>
                { elements }
            </View>
        )
    }

    // TODO: Clear or use
    // not used for now // 2019-03-06, Alex K
    renderIcon(type, name, onPressFunc) {
        let result = null;

        switch (type) {
            case 'back':
                result = (
                    <TouchableOpacity onPress={onPressFunc} >
                        <IconAwesome name={name} size={this.iconSize} />
                    </TouchableOpacity>
                );
                break;
            case 'forward':
                const canGoForward = this.state.canGoForward;
                result = (
                    canGoForward
                    ?
                    <TouchableOpacity onPress={onPressFunc} >
                        <IconAwesome name={name} size={this.iconSize} />
                    </TouchableOpacity>
                    :
                    <View />
                );
                break;
        }
        
        return (
            <View style={{
                // backgroundColor: 'orange', 
                borderWidth:0, 
                // width: size,
                // height: size,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'flex-end',
                // borderColor:'orange',
                // borderRadius: size*3/4,
                marginHorizontal:40,
                shadowOffset: {width: 0, height: 0},
                shadowColor: 'red',
                shadowOpacity: 0.5,
                shadowRadius: 5
            }}>
                {result}
            </View>
        );
    }

    renderButtonsOverBar() {
        return (
            <View style={{
                flexDirection:'row',
                position:'absolute',
                justifyContent: 'space-between',
                width:'100%',
                // backgroundColor:'red',
                top: "90%",

            }}>
                {/* { this.renderIcon('globe-alt') } */}
                {/* <View /> */}
                {/* { this.renderIcon('map') } */}
                {/* { this.renderIcon('forward','arrow-right', this.onForwardPress) } */}
                { this.renderIcon('back','arrow-left', this.onBackPress) }
            </View>
        );
    }

    renderButtonBar({layout, order}) {
        const style = ( layout == 'top' ? styles.topBar : styles.bottomBar );
        const buttonsByOrder = {
            simple: [
                this.renderButton('back'           , layout, order),
                this.renderButton('resultsORsearch', layout, order)
            ],
            normal: [
                this.renderButton('back'           , layout, order),
                this.renderButton('forward'        , layout, order),
                this.renderButton('filters'        , layout, order),
                this.renderButton('map'            , layout, order),
                this.renderButton('resultsORsearch', layout, order)
    
            ],
            mirror: [
                this.renderButton('resultsORsearch', layout, order),
                this.renderButton('map'            , layout, order),
                this.renderButton('filters'        , layout, order),
                this.renderButton('back'           , layout, order),
                this.renderButton('forward'        , layout, order),
            ],
            android: [
                this.renderButton('resultsORsearch', layout, order),
                this.renderButton('map'            , layout, order),
                this.renderButton('filters'        , layout, order),
                this.renderButton('forward'        , layout, order),
                <View style={{marginRight:10}} />
                // this.renderButton('back'          , layout),
            ]
        };

        return (
            <View style={style}>
                { buttonsByOrder[order] }
            </View>
        )
    }

    render() {
        const patchPostMessageJsCode = '(' + String(this.patchPostMessageFunction) + ')();';

        // console.log('### [RENDER] State', {
        //     state: this.state,
        //     props: this.props,
        //     webViewRef: this.webViewRef,
        // });
        
        const buttonBarStyle = {
            layout: 'bottom', // top, bottom 
            order:  'simple' // mirror, android, normal
        }

        return (
            <View style={styles.container}>
                {/* {                               (buttonBarStyle.layout == "top") ?  */}
                    {/* this.renderButtonBar(buttonBarStyle)                         : null } */}

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

                {/* { this.renderButtonsOverBar('bottom') } */}

                {/* {                               (buttonBarStyle.layout == "bottom") ?  */}
                    {/* this.renderButtonBar(buttonBarStyle)                            : null } */}
                    { this.renderButtonsOverBar() }
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
export default connect(mapStateToProps, null)(Property);
