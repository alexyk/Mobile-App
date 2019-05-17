import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import FontAwesome, { Icons } from 'react-native-fontawesome';
import styles from './styles';
import { imgHost } from '../../../../config';
import { log } from '../../../../config-debug';
import lang from '../../../../language';
import red_marker from '../../../../assets/red_marker.png';
import blue_marker from '../../../../assets/blue_marker.png';
import FastImage from 'react-native-fast-image'
import { RoomsXMLCurrency } from '../../../../services/utilities/roomsXMLCurrency';
import { CurrencyConverter } from '../../../../services/utilities/currencyConverter'
import LocPrice from '../../../atoms/LocPrice'
import {calculateCoordinatesGridPosition} from '../utils'

class MapModeHotelsSearch extends Component {
    _markers = [];
    constructor(props) {
        super(props);
        log('map-view',`Constructor`,{props});

        const isValid = (!isNaN(props.initialLat) && !isNaN(props.initialLon))

        this.state = {
            isFilterResult: props.isFilterResult,
            initialLat: (isValid) ? parseFloat(props.initialLat) : 42.698334,
            initialLon: (isValid) ? parseFloat(props.initialLon) : 23.319941,
            prevHotelsInfo: null,
            selectedMarkerIndex: -1,
            selectedData: null,
            selectedRegion: {
                latitude: props.initialLat,
                longitude: props.initialLon,
                latitudeDelta: 0.25,
                longitudeDelta: 0.25
            },
            previousLatDelta: null,
            renderedMarkers: null,
            markersMap: null,
            prevMarkersMap: null
        }
        
        this.regionChanging = false;
        this.regionQuick = this.state.selectedRegion;

        this.onRegionChange = this.onRegionChange.bind(this)
        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this)
        this.onCalloutPress = this.onCalloutPress.bind(this)
        this.onPressMap = this.onPressMap.bind(this)
        //this.allMarkers = []
    }

    componentDidMount() {
        if (this._map != null) {
            this._map.animateToRegion(this.state.selectedRegion, 0);
            const {newList:renderedMarkers, map:markersMap} = this.prepareMarkers(this.state.selectedRegion);
            this.setState({renderedMarkers, markersMap});
        }
    }
    
    renderImageInCallout = (hotel) => {
        let thumbnailURL;
        const {thumbnail} = hotel;
        
        thumbnailURL = imgHost + (
            thumbnail && thumbnail.url
                ? thumbnail.url
                : thumbnail
                    ? thumbnail
                    : ''//DEFAULT_HOTEL_PNG
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
                            hotel.thumbnail != null && this.renderImageInCallout(hotel)
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
                        {hotel.stars.map(i => <FontAwesome key={"star_"+i}>{Icons.starO}</FontAwesome>)}
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
                    selectedData: this.props.hotelsInfo[index]
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
        const now = Date.now()
        console.time(`*** MapModeHotelsSearch::renderMarkers ${now}`)

        if (!this.props.isMap) {
            console.timeEnd(`*** MapModeHotelsSearch::renderMarkers ${now}`)
            return null;
        }        
        //this.allMarkers = [];
        let renderedMarkers = this.state.renderedMarkers;

        const prev = this.state.prevHotelsInfo;
        const current = this.props.hotelsInfo;
        // log('map-markers-render',`prev: ${prev ? prev.length : 'n/a'}    current: ${current.length}/${renderedMarkers?renderedMarkers.length:'n/a'}`,{prev,current,state:this.state,props:this.props})

        //log('map-msettingarkers',{all:this.allMarkers})
        console.timeEnd(`*** MapModeHotelsSearch::renderMarkers ${now}`)

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

        log('callout',`callout data`,{item,data,extraParams,props,state})

        const func = () => this.props.gotoHotelDetailsPage(item, state, extraParams);
        this.hideCallout();
        setTimeout(func,100)
    }


    /**
     * @returns (Object) {newList,map}
     */
    prepareMarkers(region, isZoomOut=false, oldMap=null) {
        console.time('*** MapModeHotelsSearch::prepareMarkers')
        
        const _this = this;
        let optimisationMap = {};
        const {latitude:regionLat, latitudeDelta: regionLatDelta, longitude: regionLon, longitudeDelta: regionLonDelta} = (region);
        let divisorH = 11;
        let divisorW = 20;
        let latStep = (regionLatDelta != null ? regionLatDelta / divisorW : -1);
        let lonStep = (regionLonDelta != null ? regionLonDelta / divisorH : -1);
        
        let map = {};
        let newList = [];
        this.props.hotelsInfo.forEach((marker, index) => {
            let {latitude, longitude, id} = marker;
            if (latitude != null) {
                latitude = parseFloat(latitude);
                longitude = parseFloat(longitude);
                let isSkipRender = false;

                /*
                // debug
                this.allMarkers.push({lat:latitude, lon:longitude});
                if (index==this.props.hotelsInfo.length-1) {
                    this.allMarkers.push({regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep})
                }*/


                // if region is not set or the map is too zoomed in
                let grid;
                if (regionLatDelta != null && this.props.optimiseMarkers && regionLatDelta > 0.03) {
                    grid = calculateCoordinatesGridPosition(latitude, longitude, regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep);
                    if (grid != null) {
                        let {latIndex,lonIndex} = grid
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
                    console.log(`[Map] case 1 - gridPos: ${grid}`,{grid})
                    return null;
                }
                
                const current = (
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

                // do not add new markers on zoom out
                if (! (isZoomOut && oldMap && !oldMap[id]) ) {
                    map[id] = current;
                    newList.push(current);
                }
            } else {
                console.log(`[Map] case 2 - null coord: ${latitude}/${longitude}`,{marker,index})
                return null;
            }
        })

        console.timeEnd('*** MapModeHotelsSearch::prepareMarkers')

        console.log('[Map] Prepared markers', {newList,map,hotels:this.props.hotelsInfo})
        
        return {
            newList,
            map
        }
    }
    
    onRegionChange(region) {
        if (!this.regionChanging) {
            this.regionChanging = true;
            //this.setState({initialLat:this.props.initialLat, initialLon:this.props.initialLon, renderedMarkers: []})
        } else {
            // hide markers on region change
            /* if (region.latitudeDelta > this.regionQuick.latitudeDelta + 0.01) {
                this.setState({renderedMarkers:[], markersMap: {}});
            } */
            this.regionQuick = region;
        }
    }

    onRegionChangeComplete(region) {
        console.time('*** MapModeHotelsSearch::onRegionComplete')

        this.regionChanging = false;
        this.regionQuick = region;

        const hasSelectedMarkRendered = (this.selectedMarker != null);
		if (hasSelectedMarkRendered) {
			this.selectedMarker.showCallout();
        }
        const {latitude, longitude, latitudeDelta, longitudeDelta} = region;

        
        if (Math.abs(this.state.previousLatDelta - latitudeDelta) <= 0.05 ) {
            //log('map-view', `SKIP Region change latDelta:${latitudeDelta} lonDelta:${longitudeDelta}`, {region});
            return
        }
        // log('map-view', `Region change latDelta:${latitudeDelta} lonDelta:${longitudeDelta}`, {region});


        let previousLatDelta = this.state.previousLatDelta;
        const currentLatDelta = latitudeDelta;
        let isRefreshMarkers = false;
        const deltaDiff = (previousLatDelta - currentLatDelta)
        if (previousLatDelta) {
            if ( Math.abs(deltaDiff) > 0.01 ) {
                previousLatDelta = currentLatDelta;
                isRefreshMarkers = true;
            }
        } else {
            previousLatDelta = currentLatDelta;
            isRefreshMarkers = true;
        }

        let newState;
        if (isRefreshMarkers) {
            const isZoomOut = deltaDiff<0
            const {newList:renderedMarkers, map:markersMap} = this.prepareMarkers(region, isZoomOut, oldMap);
            const oldMap = this.state.prevMarkersMap;

            if (!isZoomOut) {
                // leave old markers if zooming in
                for (let id in oldMap) {
                    if (!markersMap[id]) {
                        renderedMarkers.push(oldMap[id]);
                    }
                }
            }

            newState = {selectedRegion: region, renderedMarkers, markersMap, prevMarkersMap:this.state.markersMap, previousLatDelta};
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

        console.timeEnd('*** MapModeHotelsSearch::onRegionComplete')
    }

    render() {
        console.time('*** MapModeHotelsSearch::render')

        const initialRegion = {
            latitude: this.state.initialLat,
            longitude: this.state.initialLon,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2
        }

        //log('map-render',`lat: ${this.state.initialLat} lon: ${this.state.initialLon}  markers:${this.state.renderedMarkers.length}`,{state:this.state,props:this.props})

        // const hasValidSelectedIndex = (this.props.hotelsInfo[this.state.selectedMarkerIndex] != null);
        // let selectedMarkerData = (hasValidSelectedIndex ? this.props.hotelsInfo[this.state.selectedMarkerIndex] : null);

        console.timeEnd('*** MapModeHotelsSearch::render')

        return (
            <View style={this.props.style}>
                <MapView
                    ref={(ref) => this._map = ref}
                    initialRegion={initialRegion}
                    style={styles.map}
                    onRegionChange={this.onRegionChange}
                    onRegionChangeComplete={this.onRegionChangeComplete}
                    onPress={this.onPressMap}
                >
                    { this.renderMarkers()                          }
                    {/* { this.renderSelectedMarkerWithCallout(selectedMarkerData) } */}
                    
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