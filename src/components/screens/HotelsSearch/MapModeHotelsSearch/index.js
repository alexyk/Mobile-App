import React, { Component } from 'react';
import { Text, View, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import WebView from "react-native-webview";
import LTIcon from '../../../atoms/LTIcon';
import MapView, { Marker } from 'react-native-maps';
import { connect } from 'react-redux';
import blue_marker from '../../../../assets/blue_marker.png';
import red_marker from '../../../../assets/red_marker.png';
import { imgHost } from '../../../../config';
import { processError, rlog, telog, tslog } from '../../../../config-debug';
import lang from '../../../../language';
import { CurrencyConverter } from '../../../../services/utilities/currencyConverter';
import { RoomsXMLCurrency } from '../../../../services/utilities/roomsXMLCurrency';
import LocPrice from '../../../atoms/LocPrice';
import { calculateCoordinatesGridPosition, generateListItemKey } from '../utils';
import styles from './styles';
import { DEFAULT_HOTEL_PNG } from '../../../../config-settings';


class MapModeHotelsSearch extends Component {
    _markers = [];
    constructor(props) {
        super(props);

        const isValid = (!isNaN(props.initialLat) && !isNaN(props.initialLon))

        this.state = {
            isFilterResult: props.isFilterResult,
            initialLat: (isValid) ? parseFloat(props.initialLat) : 42.698334,
            initialLon: (isValid) ? parseFloat(props.initialLon) : 23.319941,
            prevHotelsInfo: null,
            prevSelectedMarkerIndex: -1,
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

        // this.prevSelectedMarkerIndex = -1;
        // this.selectedMarkerIndex = -1;
        // this.selectedData = null;
        
        this.regionChanging = false;
        this.regionQuick = this.state.selectedRegion;

        this.onRegionChange = this.onRegionChange.bind(this)
        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this)
        this.onCalloutPress = this.onCalloutPress.bind(this)
        this.onPressMap = this.onPressMap.bind(this)
        //this.allMarkers = []

        this.itemId = 0;
    }

    componentDidCatch(error, errorInfo) {
        processError(`[MapModeHotelsSearch] Error in component: ${error.message}`, {error,errorInfo});
    }

    componentDidMount() {
        if (this._map != null) {
            this._map.animateToRegion(this.state.selectedRegion, 0);
            const {newList:renderedMarkers, map:markersMap} = this.prepareMarkers(this.state.selectedRegion);
            this.setState({renderedMarkers, markersMap});
        }
    }

    componentDidUpdate(oldProps, prevState) {
        const newProps = this.props;
        const {hotelsInfo:hotelsOld} = oldProps;
        const {hotelsInfo:hotelsNew} = newProps;

        // force markers re-rendering if hotelsInfo ref or length changed
        if (hotelsOld !== hotelsNew 
                || (hotelsOld && hotelsNew && hotelsOld.length != hotelsNew.length) 
            )
        {
            const {newList:renderedMarkers, map:markersMap} = this.prepareMarkers(prevState.selectedRegion);
            this.setState({renderedMarkers,markersMap})
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
                    : DEFAULT_HOTEL_PNG
        )

        if (Platform.OS == 'android') {
            return (
                <WebView
                    style={{ width: 120, height: 90, marginLeft:-3.5, backgroundColor:'#fff'}}
                    source={{html: "<img src=" + thumbnailURL + " width='120'/>" }}
                    javaScriptEnabledAndroid={true}
                />
            )
        } else {
            return(
                <FastImage
                    style={{ width: 120, height: 90}}
                    source={{
                        // uri: thumbnailURL,
                        uri: imgHost + DEFAULT_HOTEL_PNG,
                        priority: FastImage.priority.high,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                />
            );
        }

    }

    renderCalloutStars = ({stars}) => {
        let result = null;
        if (stars != null) {
            const arr = Array(stars).fill();
            try {
                result = (
                    <Text style={styles.ratingsMap}>
                        { arr.map((item,index) => <LTIcon isText key={`star_${index}_${this.itemId}`} name={'starO'} />) }
                    </Text>
                )
            } catch (error) {
                processError(`[MapModeHotelsSearch] Error rendering stars in callout: ${error.message}`,{error});
            }
        }
        return result;
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
        } catch (error) {
            processError(`[MapModeHotelsSearch::renderCallout] Error calculating price: ${error.message}`,{error,price,currency,daysDifference,currencySign,hotel})
        }

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
                    { this.renderCalloutStars(hotel) }
                </View>
            </MapView.Callout>
        );
    }

    onPressMarker = (e, indexParam) => {
        const {data,ref,index} = this._markers[indexParam];

        // rlog("onPressMarker", `thumb:${data.thumbnail} index:${index} id:${data.id}`, {index,e,data,props:this.props});

        if (this.state.selectedMarkerIndex != index) {
            this.selectedMarker = ref;
            if (this.selectedMarker) {
                        // change selection
                // let renderedMarkers = this.state.renderedMarkers.map((item,index) => {
                //     if ( (index == this.state.selectedMarkerIndex) 
                //         || (index == this.state.prevSelectedMarkerIndex) )
                //     {
                //         // re-render previously selected or currently
                //         return this.renderSingleMarker(index,this._markers[index].data);
                //     } else {
                //         return item;
                //     }
                // })
                this.setState((prev) => {
                    return {
                        prevSelectedMarkerIndex: prev.selectedMarkerIndex,
                        selectedMarkerIndex: index,
                        // renderedMarkers,
                        selectedData: data
                }});
            }
        }
    }

    onPressMap = (e) => {
        rlog('map-press',`e: ${e}`,{e})
        const index = this.state.selectedMarkerIndex;
        /* if (index != -1 && this._markers[index]) {
            //this._markers[index].hideCallout();
            this.selectedMarker = null;
            this.setState(
                (prev) => ({selectedMarkerIndex: -1,prevSelectedMarkerIndex: prev.selectedMarkerIndex, selectedData: null})
            );
        } */
    }

    renderMarkers() {
        let renderedMarkers = this.state.renderedMarkers;
        // log('render-markers', `${renderedMarkers ? renderedMarkers.length : 0}`)

        const now = Date.now()
        tslog(`*** MapModeHotelsSearch::renderMarkers ${now}`)

        if (!this.props.isMap) {
            telog(`*** MapModeHotelsSearch::renderMarkers ${now}`)
            return null;
        }        
        //this.allMarkers = [];

        /* 
        const prev = this.state.prevHotelsInfo;
        const current = this.props.hotelsInfo;
        log('map-markers-render',`prev: ${prev ? prev.length : 'n/a'}    current: ${current.length}/${renderedMarkers?renderedMarkers.length:'n/a'}`,{prev,current,state:this.state,props:this.props})
 */
        //log('map-msettingarkers',{all:this.allMarkers})
        telog(`*** MapModeHotelsSearch::renderMarkers ${now}`)

        return renderedMarkers;
    }
    
    onCalloutPress(item) {
        const data = this.state.selectedData;
        const { props, state } = this.props.parentProps;

        if (data) {
            const extraParams = {
                currency: this.props.currency,
                baseUrl: `mobile/hotels/listings/${data.id}?`,
                token: props.navigation.state.params.token,
                email: props.navigation.state.params.email,
                propertyName: data.name,
                title: lang.TEXT.SEARCH_HOTEL_DETAILS_TILE,
                isHotel: true
            };
            
            const func = () => this.props.gotoHotelDetailsPage(item, state, extraParams);
            setTimeout(func)
        }
    }

    renderSingleMarker(index,data) {
        const {latitude, longitude} = data;
        const coordinates = {latitude, longitude};
        const selectedIndex = this.state.selectedMarkerIndex;
        this.itemId = generateListItemKey('MAP_MARKER_ID');

        return (
            <Marker
                image={selectedIndex == index  ? blue_marker : red_marker}
                style={selectedIndex == index ? {zIndex: 1} : null}
                key={this.itemId}
                ref={(ref) => this._markers[index] = {ref,data,index}}
                coordinate={coordinates}
                onPress={(e) => this.onPressMarker(e, index)}
                onCalloutPress={item => this.onCalloutPress(item)}
            >
                {this.renderCallout(data)}
            </Marker>
        )
    }

    /**
     * @returns (Object) {newList,map}
     */
    prepareMarkers(region, isZoomOut=false, oldMap=null) {
        tslog('*** MapModeHotelsSearch::prepareMarkers')
        
        let optimisationMap = {};
        const {latitude:regionLat, latitudeDelta: regionLatDelta, longitude: regionLon, longitudeDelta: regionLonDelta} = (region);
        let divisorH = 11;
        let divisorW = 20;
        let latStep = (regionLatDelta != null ? regionLatDelta / divisorW : -1);
        let lonStep = (regionLonDelta != null ? regionLonDelta / divisorH : -1);
        
        let map = {};
        let newList = [];
        const count = this.props.hotelsInfo.length;
        this.props.hotelsInfo.forEach((data, index) => {
            let {latitude, longitude, id} = data;
            if (latitude != null) {
                let isSkipRender = false;
    
                /*
                // debug
                this.allMarkers.push({lat:latitude, lon:longitude});
                if (index==this.props.hotelsInfo.length-1) {
                    this.allMarkers.push({regionLat, regionLatDelta, regionLon, regionLonDelta, latStep, lonStep})
                }*/
    
    
                // if region is not set or the map is too zoomed in
                let grid;
                if (regionLatDelta != null && (count > 50 || (this.props.optimiseMarkers && regionLatDelta > 0.03)) ) {
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
                    //console.log(`[Map] case 1 - gridPos: ${grid}`,{grid})
                    return null;
                }
                
                const rendered = this.renderSingleMarker(index, data);
    
                // do not add new markers on zoom out
                if (! (isZoomOut && oldMap && !oldMap[id]) ) {
                    map[id] = rendered;
                    newList.push(rendered);
                }
            } else {
                //console.log(`[Map] case 2 - null coord: ${latitude}/${longitude}`,{data,index})
                return null;
            }
        })

        telog('*** MapModeHotelsSearch::prepareMarkers')

        //console.log('[Map] Prepared markers', {newList,map,hotels:this.props.hotelsInfo})
        
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
        tslog('*** MapModeHotelsSearch::onRegionComplete')

        this.regionChanging = false;
        this.regionQuick = region;

        const hasSelectedMarkRendered = (this.selectedMarker != null);
		if (hasSelectedMarkRendered) {
			//this.selectedMarker.showCallout();
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

        telog('*** MapModeHotelsSearch::onRegionComplete')
    }

    render() {
        tslog('*** MapModeHotelsSearch::render')

        const initialRegion = {
            latitude: this.state.initialLat,
            longitude: this.state.initialLon,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2
        }

        //log('map-render',`lat: ${this.state.initialLat} lon: ${this.state.initialLon}  markers:${this.state.renderedMarkers.length}`,{state:this.state,props:this.props})

        // const hasValidSelectedIndex = (this.props.hotelsInfo[this.state.selectedMarkerIndex] != null);
        // let selectedMarkerData = (hasValidSelectedIndex ? this.props.hotelsInfo[this.state.selectedMarkerIndex] : null);

        telog('*** MapModeHotelsSearch::render')

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
export default connect(mapStateToProps)(MapModeHotelsSearch);

// export default MapModeHotelsSearch;