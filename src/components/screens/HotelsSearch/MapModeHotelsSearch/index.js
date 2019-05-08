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
            selectedRegion: {},
            previousLatDelta: null,
            renderedMarkers: null
        }
        
        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this)
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

        if (hotel == null) {
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

    renderSelectedMarkerWithCallout(data) {
        return (
            data != null && 
            (
                <Marker
                    image={blue_marker}
                    style={{zIndex: 1}}
                    // image={red_marker}
                    key={"selected_mark"}
                    ref={(ref) => this.selected_mark = ref}
                    coordinate={{
                        latitude: data.lat == null ? parseFloat(data.latitude) : parseFloat(data.lat),
                        longitude: data.lon == null ? parseFloat(data.longitude) : parseFloat(data.lon)
                    }}
                    tracksViewChanges = {true}
                    onCalloutPress={() => {this.props.gotoHotelDetailsPage(data); log('here','pressing item',{data})}}
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

                /*this.allMarkers.push({lat:latitude, lon:longitude});
                if (index==this.state.hotelsInfo.length-1) {
                    this.allMarkers.push({regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep})
                }*/


                // if region is not set or the map is too zoomed in
                if (regionLatDelta != null && this.props.optimiseMarkers &&  regionLatDelta > 0.03) {
                    //TODO: Calculate optimisation data

                    let result = calculateCoordinatesGridPosition(latitude, longitude, regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep);
                    if (result != null) {
                        let {latIndex,lonIndex} = result
                        let name = `${latIndex}_${lonIndex}`;
                        // log('hello2-1',`skipping hotel ${index+1}, lat:${latitude.toFixed(4)}, lon:${longitude.toFixed(4)}, ${optimisationMap[name]}`)
                        if (optimisationMap[name] != null) {
                            isSkipRender = true;
                        } else {
                            optimisationMap[name] = true;
                        }
                    } else {
                        //log('hello2-2',`skipping hotel ${index+1}, lat:${latitude.toFixed(4)}, lon:${longitude.toFixed(4)}`);
                        //log('hello2-2',`skipping hotel ${index+1}, lat:${latitude.toFixed(4)}, lon:${longitude.toFixed(4)}, regionLat:${regionLat.toFixed(4)}/${regionLatDelta.toFixed(4)}, regionLon:${regionLon.toFixed(4)}/${regionLonDelta.toFixed(4)}`);
                        isSkipRender = true;
                    }
                }

                // isNaN -> fix for iOS - JSON value null of NSNULL cannot be converted to CLLLocationDergees
                // isSkipRender -> optimise overlaping markers
                if (isNaN(longitude) || isNaN(latitude) || isSkipRender) {
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

        return result
    }
    
    onRegionChangeComplete(region) {
        const hasSelectedMarkRendered = (this.selected_mark != null);
		if (hasSelectedMarkRendered) {
			this.selected_mark.showCallout();
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