import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, View, TouchableOpacity} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import FontAwesome, { Icons } from 'react-native-fontawesome';
import _ from 'lodash';
import styles from './styles';
import { imgHost } from '../../../../config';
import { log } from '../../../../config-debug';
import red_marker from '../../../../assets/red_marker.png';
import blue_marker from '../../../../assets/blue_marker.png';
import FastImage from 'react-native-fast-image'
import { RoomsXMLCurrency } from '../../../../services/utilities/roomsXMLCurrency';
import { CurrencyConverter } from '../../../../services/utilities/currencyConverter'
import LocPrice from '../../../atoms/LocPrice'

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
            selectedMarkerIndex: -1
        }
    }

    componentDidUpdate(prevProps) {
        // if (this.props.currency != prevProps.currency || this.props.locRate != prevProps.locRate) {
        let newState  = {};
        let isChanged = false;

        if (this.props.isFilterResult !== prevProps.isFilterResult) {
            newState = {...newState, isFilterResult: this.props.isFilterResult};
            isChanged = true;
        }

        if (this.props.initialLat !== prevProps.initialLat || this.props.initialLon !== prevProps.initialLon) {
            //newState = {...newState, initialLat: this.props.initialLat, initialLon: this.props.initialLon};
            //console.log("123123123 change")
            this.state.initialLat = this.props.initialLat;
            this.state.initialLon = this.props.initialLon;
            if (this._map != null) {
                this._map.animateToRegion({
                    latitude: this.state.initialLat,
                    longitude: this.state.initialLon,
                    latitudeDelta: 0.25,
                    longitudeDelta: 0.25
                }, 0);
            }
            //isChanged = true;
        }

        if (this.props.hotelsInfo !== prevProps.hotelsInfo) {
            newState = {...newState, hotelsInfo: this.props.hotelsInfo};
            isChanged = true;
        }

        if (isChanged) {
            //console.log("--------------------", newState);
            this.setState(newState);
        }
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
        //console.log("renderImageInCallout", hotel);
        if (hotel.latitude == null || hotel.longitude == null || hotel.thumbnail == null) {
            thumbnailURL = imgHost + hotel.hotelPhoto;
        }
        else {
            thumbnailURL = imgHost + hotel.thumbnail.url;
        }
        //console.log("----------------- renderImageInCallout", thumbnailURL);

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
                onLoadEnd={e => {console.log("onLoadEnd"); that.selected_mark.showCallout();}}
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
        //console.log("----------------- renderCallout", hotel);

        if (hotel === undefined || hotel === null) {
            return null;
        }
        
        const {
            currencySign, exchangeRates, currency, daysDifference
        } = this.props;

        let price = exchangeRates.currencyExchangeRates 
            && ((CurrencyConverter.convert(exchangeRates.currencyExchangeRates, RoomsXMLCurrency.get(), currency, hotel.price)) / daysDifference).toFixed(2);

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
                        price == null || price == undefined ?
                            <Text style={styles.description}>
                                Unavailable
                            </Text>
                        : 
                            <View style={{flex: 1, flexDirection:'row'}}>
                                <Text style={styles.description}>
                                    {currencySign}{price}
                                </Text>
                                <LocPrice style= {styles.description} fiat={hotel.price} fromParentType={0}/>
                                <Text style={styles.description}>
                                        / Night
                                </Text>
                            </View>
                    }
                    <Text style={styles.ratingsMap}>
                        {
                            Array(hotel.stars !== null && hotel.stars).fill().map(i => <FontAwesome key={"star_"+i}>{Icons.starO}</FontAwesome>)
                        }
                    </Text>
                </View>
            </MapView.Callout>
        );
    }

    onPressMarker = (e, index) => {
        //console.log("onPressMarker", index);
        if (this.state.selectedMarkerIndex === index) {
            return;
        }
        this.setState({selectedMarkerIndex: index});
    }

    onPressMap = (hotel) => {
        //console.log("1123123123123", hotel);
        // this.setState({selectedMarkerIndex: -1});
    }

    renderMarkers() {
        const _this = this;
        
        const result = this.state.hotelsInfo.map((marker, index) => {
            if (marker.latitude != null) {
                const latitude = parseFloat(marker.latitude);
                const longitude = parseFloat(marker.longitude);

                // fix for iOS - JSON value null of NSNULL cannot be converted to CLLLocationDergees
                if (isNaN(longitude) || isNaN(latitude)) {
                    return null;
                }
                
                //TODO: @@debug remove
                {/* console.log(`[MapModeHotelsSearch] Map Marker ${index}:  ${longitude}/${latitude} name='${marker.name}' lat=${marker.lat}/${marker.latitude} lon=${marker.lon}/${marker.longitude}, `) */}
                {/* console.tron.log(`[MapModeHotelsSearch] Map Marker ${index}:  lon=${longitude}/lat=${latitude} name='${marker.name}'`) */}

                return (
                    <Marker
                        image={_this.state.selectedMarkerIndex === index ? blue_marker : red_marker}
                        style={_this.state.selectedMarkerIndex === index ? {zIndex: 1} : null}
                        // image={red_marker}
                        key={index}
                        ref={(ref) => _this._markers[index] = ref}
                        coordinate={{latitude, longitude}}
                        onPress={(e) => _this.onPressMarker(e, index)}
                        // onCalloutPress={() => {_this.props.onClickHotelOnMap(marker)}} //eslint-disable-line
                    >
                        {/* {_this.state.selectedMarkerIndex === i && _this.{{render}}Callout(marker)} */}
                    </Marker>
                )
            } else {
                return null;
            }
        })

        //log('map-msettingarkers',{result,hotelsInfo:this.state.hotelsInfo})
        return result;
    }

    render() {
        let hotel = null;
        if (this.state.selectedMarkerIndex != -1 && this.state.selectedMarkerIndex < this.state.hotelsInfo.length) {
            hotel = this.state.hotelsInfo[this.state.selectedMarkerIndex];
        }

        const initialRegion = {
            latitude: this.state.initialLat,
            longitude: this.state.initialLon,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2
        }

        return (
            <View style={this.props.style}>
                <MapView
                    ref={(ref) => this._map = ref}
                    initialRegion={initialRegion}
                    style={styles.map}
                    onRegionChangeComplete={() => {if (this.selected_mark !== undefined && this.selected_mark !== null) this.selected_mark.showCallout();}}
                >
                { this.renderMarkers() }
                {
                    hotel !== null && 
                        (
                            <Marker
                                image={blue_marker}
                                style={{zIndex: 1}}
                                // image={red_marker}
                                key={"selected_mark"}
                                ref={(ref) => this.selected_mark = ref}
                                coordinate={{
                                    latitude: hotel.lat == null ? parseFloat(hotel.latitude) : parseFloat(hotel.lat),
                                    longitude: hotel.lon == null ? parseFloat(hotel.longitude) : parseFloat(hotel.lon)
                                }}
                                tracksViewChanges = {true}
                                onCalloutPress={() => {this.props.gotoHotelDetailsPage(hotel)}}
                            >
                                {
                                    this.renderCallout(hotel)
                                }
                            </Marker>
                        )
                       
                }
                    
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