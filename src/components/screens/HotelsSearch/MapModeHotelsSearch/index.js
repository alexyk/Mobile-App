import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, View, TouchableOpacity} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import FontAwesome, { Icons } from 'react-native-fontawesome';
import styles from './styles';
import { imgHost, DEFAULT_HOTEL_PNG } from '../../../../config';
import { log } from '../../../../config-debug';
import lang from '../../../../language';
import red_marker from '../../../../assets/red_marker.png';
import blue_marker from '../../../../assets/blue_marker.png';
import FastImage from 'react-native-fast-image'
import { RoomsXMLCurrency } from '../../../../services/utilities/roomsXMLCurrency';
import { CurrencyConverter } from '../../../../services/utilities/currencyConverter'
import LocPrice from '../../../atoms/LocPrice'
import {calculateCoordinatesGridPosition} from '../../../screens/utils'

class MapModeHotelsSearch extends Component {
    _markers = [];
    constructor(props) {
        super(props);

        const isValid = (!isNaN(props.initialLat) && !isNaN(props.initialLon))

        this.state = {
            isFilterResult: props.isFilterResult,
            initialLat: (isValid) ? parseFloat(props.initialLat) : 42.698334,
            initialLon: (isValid) ? parseFloat(props.initialLon) : 23.319941,
            hotelsInfo: props.hotelsInfo,
            prevHotelsInfo: null,
            selectedMarkerIndex: -1,
            selectedData: null,
            selectedRegion: {},
            previousLatDelta: null,
            renderedMarkers: null
        }
        
        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this)
        this.onCalloutPress = this.onCalloutPress.bind(this)
        this.onPressMap = this.onPressMap.bind(this)
        //this.allMarkers = []
    }

    componentDidMount() {
        /*if (this._map != null) {
            this._map.animateToRegion({
                latitude: this.state.initialLat,
                longitude: this.state.initialLon,
                latitudeDelta: 0.25,
                longitudeDelta: 0.25
            }, 0);
        }*/
    }

    initMapView = () => {
        this.state.selectedMarkerIndex = -1;
    }

    refresh = (hotelsInfo) => {
        //console.log("refresh--------------------");
        this.setState({hotelsInfo: hotelsInfo});
    }
    
    renderImageInCallout = (hotel) => {
        const that = this;
        let thumbnailURL;
        const {thumbnail, hotelPhoto} = hotel;

        const hasThumbnail = (thumbnail &&  
            (
                (thumbnail.url && thumbnail.url.length > 0)
                || (typeof(thumbnail) == 'string' && thumbnail.length > 0)
            )
        );
        const hasHotelPhoto = (hotelPhoto &&  
            (
                (hotelPhoto.url && hotelPhoto.url.length > 0)
                || (typeof(hotelPhoto) == 'string' && hotelPhoto.length > 0)
            )
        );
        
        thumbnailURL = imgHost + (
            hasThumbnail
                ? (thumbnail.url ? thumbnail.url : thumbnail)
                : (hasHotelPhoto
                    ? (hotelPhoto.url ? hotelPhoto.url : hotelPhoto)
                    : DEFAULT_HOTEL_PNG
                )
        )        

        return(
            <FastImage
                style={{ width: 120, height: 90}}
                source={{
                    uri: thumbnailURL,
                    priority: FastImage.priority.high,
                }}
                resizeMode={FastImage.resizeMode.cover}
                // onLoad={e => console.log(e.nativeEvent.width, e.nativeEvent.height)}
                // onError={e => console.log("errr", e)}
                //onLoadEnd={e => {console.log("onLoadEnd"); that.selectedMarker.showCallout();}}
            />
        );
        // if(Platform.OS === 'ios') {
        //     return(
        //         // <FastImage
        //         //     style={{ width: 120, height: 90}}
        //         //     source={{
        //         //         uri: thumbnailURL,
        //         //         priority: FastImage.priority.high,
        //         //     }}
        //         //     resizeMode={FastImage.resizeMode.cover}
        //         // />
        //         <Image
        //             style={{ width: 120, height: 90}}
        //             source={{uri: thumbnailURL}}
        //             resizeMode={"cover"}
        //         />
        //     )
        // } else {
        //   return(
        //     <WebView
        //         style={{ width: 120, height: 90, marginLeft:-3.5, backgroundColor:'#fff'}}
        //         source={{html: "<img src=" + thumbnailURL + " width='120'/>" }}
        //         javaScriptEnabledAndroid={true}
        //     />
        //   )
        // }
    }

    renderCallout = (hotel) => {
        if (hotel == null) {
            return null;
        }
        
        const {
            currencySign, exchangeRates, currency, daysDifference
        } = this.props;

        let price = null;
        try {
            price = exchangeRates.currencyExchangeRates 
                && ((CurrencyConverter.convert(exchangeRates.currencyExchangeRates, RoomsXMLCurrency.get(), currency, hotel.price)) / daysDifference).toFixed(2);
        } catch (e) {}

        return (
            <MapView.Callout tooltip={false}>
                <View style={ styles.map_item }>
                    <View style={{ width: 120, height: 90, backgroundColor:'#fff' }}>
                        { 
                            hotel.thumbnail !== null && this.renderImageInCallout(hotel)
                        }
                    </View>
                    <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                        {hotel.name}
                    </Text>
                    {
                        price == null || price == undefined 
                        ?
                            <Text style={styles.description}>
                                Unavailable
                            </Text>
                        : 
                            <View style={{flex: 1, flexDirection:'row'}}>
                                <Text style={styles.description}>
                                    {currencySign}{price}{" "}
                                </Text>
                                <LocPrice style= {styles.description} fiat={hotel.price} fromParentType={0}/>
                                <Text style={styles.description}>
                                       {" "} / Night
                                </Text>
                            </View>
                    }
                    <Text style={styles.ratingsMap}>
                        {Array(hotel.stars !== null && hotel.stars).fill().map(i => <FontAwesome key={"star_"+i}>{Icons.starO}</FontAwesome>)}
                    </Text>
                </View>
            </MapView.Callout>
        );
    }

    onPressMarker = (e, index) => {
        log("onPressMarker", `index: ${index}`, {index,e});
        if (this.state.selectedMarkerIndex != index) {
            this.selectedMarker = this._markers[index];
            if (this.selectedMarker){
                this.selectedMarker.showCallout();
                this.setState({
                    selectedMarkerIndex: index,
                    selectedData: this.state.hotelsInfo[index]
                });
            }
        }
    }

    onPressMap = () => {
        const index = this.state.selectedMarkerIndex;
        if (index != -1) {
            this._markers[index].hideCallout();
            this.selectedMarker = null;
            this.setState({selectedMarkerIndex: -1,selectedData: null});
        }
    }

    renderMarkers() {
        if (!this.props.isMap) {
            return null;
        }        
        //this.allMarkers = [];
        let renderedMarkers = this.state.renderedMarkers;
        if (this.state.prevHotelsInfo != this.state.hotelsInfo) {
            renderedMarkers = this.prepareMarkers(this.state.selectedRegion);
        }

        //log('map-msettingarkers',{all:this.allMarkers})
        return renderedMarkers;
    }
    
    onCalloutPress(item) {
        const data = this.state.selectedData;
        const { props, state } = this.props.parentProps;
        const extraParams = {
            currency: this.props.currency,
            baseUrl: `mobile/hotels/listings/${data.id}?`,
            token: props.navigation.state.params.token,
            email: props.navigation.state.params.email,
            propertyName: data.name,
            title: lang.TEXT.SEARCH_HOTEL_DETAILS_TILE,
            isHotel: true
        };

        //log('callout',`callout data`,{item,data,extraParams,props,state})

        this.props.gotoHotelDetailsPage(item, state, extraParams);  
    }

    renderSelectedMarkerWithCallout(data) {
        return null;
        return (
            data != null && 
            (
                <Marker
                    image={blue_marker}
                    style={{zIndex: 1}}
                    // image={red_marker}
                    key={"selectedMarker"}
                    ref={(ref) => this.selectedMarker = ref}
                    coordinate={{
                        latitude: data.lat == null ? parseFloat(data.latitude) : parseFloat(data.lat),
                        longitude: data.lon == null ? parseFloat(data.longitude) : parseFloat(data.lon)
                    }}
                    tracksViewChanges = {true}
                    onCalloutPress={item => this.onCalloutPress(item)}
                >
                    {
                        this.renderCallout(data)
                    }
                </Marker>
            )
        )
    }

    prepareMarkers(region) {
        const _this = this;
        let optimisationMap = {};
        const {latitude:regionLat, latitudeDelta: regionLatDelta, longitude: regionLon, longitudeDelta: regionLonDelta} = (region);
        let divisor = 20;
        let latStep = (regionLatDelta != null ? regionLatDelta / divisor : -1);
        let lonStep = (regionLonDelta != null ? regionLonDelta / divisor : -1);
        
        const result = this.state.hotelsInfo.map((marker, index) => {
            if (marker.latitude != null) {
                const latitude = parseFloat(marker.latitude);
                const longitude = parseFloat(marker.longitude);
                let isSkipRender = false;

                /*
                // debug
                this.allMarkers.push({lat:latitude, lon:longitude});
                if (index==this.state.hotelsInfo.length-1) {
                    this.allMarkers.push({regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep})
                }*/


                // if region is not set or the map is too zoomed in
                if (regionLatDelta != null && this.props.optimiseMarkers &&  regionLatDelta > 0.03) {
                    let result = calculateCoordinatesGridPosition(latitude, longitude, regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep);
                    if (result != null) {
                        let {latIndex,lonIndex} = result
                        let name = `${latIndex}_${lonIndex}`;
                        if (optimisationMap[name] != null) {
                            isSkipRender = true;
                        } else {
                            optimisationMap[name] = true;
                        }
                    } else {
                        isSkipRender = true;
                    }
                }

                // isNaN -> fix for iOS - JSON value null of NSNULL cannot be converted to CLLLocationDergees
                // isSkipRender -> optimise overlaping markers
                if (isNaN(longitude) || isNaN(latitude) || isSkipRender) {
                    return null;
                }
                
                return (
                    <Marker
                        image={_this.state.selectedMarkerIndex === index ? blue_marker : red_marker}
                        style={_this.state.selectedMarkerIndex === index ? {zIndex: 1} : null}
                        // image={red_marker}
                        key={index}
                        ref={(ref) => _this._markers[index] = ref}
                        coordinate={{latitude, longitude}}
                        onPress={(e) => _this.onPressMarker(e, index)}
                        onCalloutPress={item => this.onCalloutPress(item)}
                    >
                        {this.renderCallout(marker)}
                    </Marker>
                )
            } else {
                return null;
            }
        })

        return result
    }
    
    onRegionChangeComplete(region) {
        const hasSelectedMarkRendered = (this.selectedMarker != null);
		if (hasSelectedMarkRendered) {
			this.selectedMarker.showCallout();
        }
        const {latitude, longitude, latitudeDelta, longitudeDelta} = region;

        // log('map-view', `Region change latDelta:${latitudeDelta} lonDelta:${longitudeDelta}`, {region});

        let previousLatDelta = this.state.previousLatDelta;
        const currentLatDelta = latitudeDelta;
        let isRefreshMarkers = false;
        if (previousLatDelta) {
            if ( Math.abs(previousLatDelta - currentLatDelta) > 0.01 ) {
                previousLatDelta = currentLatDelta;
                isRefreshMarkers = true;
            }
        } else {
            previousLatDelta = currentLatDelta;
            isRefreshMarkers = true;
        }

        let newState;
        if (isRefreshMarkers) {
            const renderedMarkers = this.prepareMarkers(region);
            newState = {selectedRegion: region, renderedMarkers, previousLatDelta};
        } else {
            newState = {selectedRegion: region, previousLatDelta}
        }

        // update position and zoom level
        newState.initialLat = latitude;
        newState.initialLon = longitude;
        if (this.props.updateCoords) {
            this.props.updateCoords({initialLat:latitude, initialLon:longitude})
        }

        this.setState(newState);
    }

    render() {
        const initialRegion = {
            latitude: this.state.initialLat,
            longitude: this.state.initialLon,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2
        }

        //log('init-coord',`lat: ${this.state.initialLat} lon: ${this.state.initialLon}`)

        const hasValidSelectedIndex = (this.state.hotelsInfo[this.state.selectedMarkerIndex] != null);
        let selectedMarkerData = (hasValidSelectedIndex ? this.state.hotelsInfo[this.state.selectedMarkerIndex] : null);

        return (
            <View style={this.props.style}>
                <MapView
                    ref={(ref) => this._map = ref}
                    initialRegion={initialRegion}
                    style={styles.map}
                    onRegionChangeComplete={this.onRegionChangeComplete}
                    onPress={this.onPressMap}
                >
                    { this.renderMarkers()                          }
                    { this.renderSelectedMarkerWithCallout(selectedMarkerData) }
                    
                </MapView>
            </View>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        currencySign: state.currency.currencySign,
        
        locAmounts: state.locAmounts,
        exchangeRates: state.exchangeRates,
    };
}
export default connect(mapStateToProps, null, null, { withRef: true })(MapModeHotelsSearch);

// export default MapModeHotelsSearch;