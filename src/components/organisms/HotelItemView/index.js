import React, { Component } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { connect } from 'react-redux';
import FontAwesome, { Icons } from 'react-native-fontawesome';
import Image from 'react-native-remote-svg';
import CardView from 'react-native-cardview'
import PropTypes from 'prop-types';
import { imgHost } from '../../../config';
import _ from 'lodash';
import FastImage from 'react-native-fast-image'
import { RoomsXMLCurrency } from '../../../services/utilities/roomsXMLCurrency';
import { CurrencyConverter } from '../../../services/utilities/currencyConverter'
import LocPrice from '../../atoms/LocPrice'

import styles from './styles';

class HotelItemView extends Component {
    static propTypes = {
        item: PropTypes.object | PropTypes.array,
        gotoHotelDetailsPage: PropTypes.func.isRequired,
        daysDifference: PropTypes.number,
        isDoneSocket: PropTypes.bool.isRequired
    };

    static defaultProps = {
        item: [],
        daysDifference : 1,
        isDoneSocket: false
    };

    constructor(props) {
        super(props);
        console.log('item props',props)
    }

    onFlatClick = (item) => {
        console.log('flat click', item, this.props);

        // if (item.price != undefined && item.price != null) {
            this.props.gotoHotelDetailsPage(item);
        // }
    }

    renderStars = (count) => {
        const indents = [];
        for (let i = 0; i < count; i ++) {
            indents.push(<Text key = {`star - ${i}`} style={{ color: '#a3c5c0' }}><FontAwesome>{Icons.star}</FontAwesome></Text>);
        }
        for (let i = count; i < 5; i ++) {
            indents.push(<Text key = {`star - ${i}`} style={{ color: '#dddddd' }}><FontAwesome>{Icons.star}</FontAwesome></Text>);
        }
        return indents;
    }

    // ratingTitle = (count) => {
    //     if (count <= 1){
    //         return 'Poor'
    //     }
    //     else if (count > 1 && count <= 2){
    //         return 'Fair'
    //     }
    //     else if (count > 2 && count <= 3){
        //         return 'Good'
        //     }
        //     else if (count > 3 && count <= 4){
            //         return 'Very Good'
            //     }
            //     else if (count > 4 && count <= 5){
                //         return 'Excellent'
                //     }
                // }


    renderPrice() {
        const {exchangeRates, currency, item, currencySign} = this.props;

        let price = item.price;
        let isPriceReady = (price != null);
        let fiatPrice = 0;
        let priceToFixed2 = 0;

        const rates = exchangeRates.currencyExchangeRates;
        const roomCurrency = RoomsXMLCurrency.get();
        const days = this.props.daysDifference;

        let content = null;

        try {
            if (exchangeRates.currencyExchangeRates && price && days && rates && roomCurrency) {
                const converted = CurrencyConverter.convert(rates, roomCurrency, currency, price);
                price = (converted / days).toFixed(2);
            }
        } catch (error) {
            // TODO: @@debug
            isPriceReady = true;

            price = -1;
        }
      
        if (this.props.isDoneSocket) {
            content =  <Text style={styles.cost} numberOfLines={1} ellipsizeMode="tail">Unavailable</Text>
            
        } else {
            // <Image style={{width:35, height:35}} source={require('../../../assets/loader.gif')}/>
            content =   <Text style={styles.cost} numberOfLines={1} ellipsizeMode="tail">Loading price ...</Text>
        }

        if (isPriceReady) {
            fiatPrice = (price / days).toFixed(0);
            priceToFixed2 = parseFloat(price).toFixed(2);
            content = [
                <Text style={styles.cost} numberOfLines={1} ellipsizeMode="tail">
                        {currencySign}{priceToFixed2}
                </Text>,
                {/* <Text style={styles.costLoc} numberOfLines={1} ellipsizeMode="tail"> (LOC {parseFloat(price/locRate).toFixed(2)}) </Text> */},
                <LocPrice style= {styles.costLoc} fiat={fiatPrice} fromParentType={0}/>,
                <Text style={styles.perNight}>per night</Text>
            ];
        }

        return (
            <View style={styles.costView}>
                {content}
            </View>
        )
    }

    render() {
        const item = this.props.item;

        //console.log(`hotel item ${item.id}`, item, this.props)

        let urlThumbnail = item.hotelPhoto != undefined && item.hotelPhoto != null?
                 (_.isString(item.hotelPhoto) ? imgHost + item.hotelPhoto : imgHost + item.hotelPhoto.url) 
                 : 
                 "";
        let stars = item.star;

        return (
            <TouchableOpacity onPress={() => this.onFlatClick(item)}>
                <CardView 
                    style = {styles.card}
                    cardElevation = {0.5}
                    cardMaxElevation = {0.5}
                    cornerRadius = {0}>
                    <View style={styles.popularHotelsImage}>
                        {
                            urlThumbnail != null && urlThumbnail != "" &&
                            <FastImage
                                style={{flex:1}}
                                source={{
                                    uri: urlThumbnail,
                                    priority: FastImage.priority.high,
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        }
                        <TouchableOpacity style={styles.favoritesButton}>
                            <Image source={require('../../../assets/png/heart.png')} style={styles.favoriteIcon} resizeMode='contain'/>
                        </TouchableOpacity>
                    </View>


                    <View style={styles.cardContent}>

                        <Text style={styles.placeName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>

                        <View style={styles.aboutPlaceView}>
                            {/* <Text style={styles.placeReviewText}>{this.ratingTitle(stars)}</Text> */}
                            <Text style={styles.placeReviewNumber}> {stars}/5 </Text>
                            <View style={styles.ratingIconsWrapper}>
                                {this.renderStars(stars)}
                            </View>
                            {/* <Text style={styles.totalReviews}> 73 Reviews </Text> */}
                        </View>

                        { this.renderPrice() }
                    </View>
                </CardView>
            </TouchableOpacity>
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
export default connect(mapStateToProps, null)(HotelItemView);