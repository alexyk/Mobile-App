import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import CardView from 'react-native-cardview'
import Image from 'react-native-remote-svg';
import PropTypes from 'prop-types';
import requester from '../../../initDependencies';
import LocPrice from '../../atoms/LocPrice'
import { RoomsXMLCurrency } from '../../../services/utilities/roomsXMLCurrency';
import { CurrencyConverter } from '../../../services/utilities/currencyConverter'
import styles from './styles';
import LTLoader from '../LTLoader';
import { commonText } from '../../../common.styles';
import lang from '../../../language';


/**
 * NOTES:
 * Using index for item keys here is ok since data is static (won't change for the life of the component)
 */
class AvailableRoomsView extends Component {
    static propTypes = {
        id: PropTypes.string,
        search: PropTypes.string,
        roomDetail: PropTypes.object,
        guests: PropTypes.number,
        hotelDetails: PropTypes.object,
        currency: PropTypes.string,
        currencySign: PropTypes.string,
        daysDifference: PropTypes.number
    };

    static defaultProps = {
        id: '',
        search: '',
        guests: 0
    };

    constructor(props) {
        super(props);
        this.state = {
            rooms: [],//ds.cloneWithRows([]),
            isLoading: true
        };

        //console.log ("AvailableRoomsView", props);
    }

    componentDidMount() {
        let request = this.props.search.replace(/\?/ig, "")
        requester.getHotelRooms(this.props.id, request.split('&')).then(res => {
            //console.log("getHotelRooms", res);
            if (res.success) {
                res.body.then(data => {
                    let roomsResults = [];
                    const rooms = data;
                    if (rooms) {
                        const usedRoomsByTypeAndMeal = {};
                        for (let room of rooms) {
                          let key = '';
                          let price = 0;
                          for (let result of room.roomsResults) {
                            key += result.name + '|' + result.mealType + '%';
                            price += result.price;
                          }
                          if (!usedRoomsByTypeAndMeal.hasOwnProperty(key)) {
                            usedRoomsByTypeAndMeal[key] = [];
                          }
                          usedRoomsByTypeAndMeal[key].push({
                            totalPrice: price,
                            quoteId: room.quoteId,
                            roomsResults: room.roomsResults,
                            key: key
                          });
                        }
                        for (let key in usedRoomsByTypeAndMeal) {
                          roomsResults.push(usedRoomsByTypeAndMeal[key].sort((x, y) => x.totalPrice > y.totalPrice ? 1 : -1));
                        }
                        roomsResults = roomsResults.sort((x, y) => this.getTotalPrice(x[0].roomsResults) > this.getTotalPrice(y[0].roomsResults) ? 1 : -1);
                      }
                      this.setState({ rooms: roomsResults, isLoading: false });
                });
            } else {
                res.errors.then(data => {
                    const { errors } = data;
                    Object.keys(errors).forEach((key) => {
                        if (typeof key !== 'function') {
                        }
                    });
                });
            }
        });
    }

    getTotalPrice = (room) => {
        let total = 0;
        for (let i = 0; i < room.length; i++) {
            total += room[i].price;
        }
    
        return total;
    };
    

    _renderRoom = (item,index) => {
        
        if (item.length > 0 && item[0].roomsResults) {
            let rowData = item[0];
            const fiat = this.getTotalPrice(rowData.roomsResults);
            const {
                currencyExchangeRates, currency, currencySign, daysDifference, onBooking
            } = this.props;
            let price = undefined;
            if (fiat != undefined)
                price = currencyExchangeRates && (CurrencyConverter.convert(currencyExchangeRates, RoomsXMLCurrency.get(), currency, fiat)).toFixed(2);
    
            return (
                <TouchableOpacity onPress={() => {onBooking(rowData)}} key={`room_${index}`} >
                    <CardView style={styles.listItem}
                        cardElevation={1.5}
                        cardMaxElevation={1.5}
                        cornerRadius={0}>
                        {
                            rowData.roomsResults.map((room, rowIndex) => {
                                return (
                                    <Text key={`row_${rowIndex}`} style={styles.name} numberOfLines={1} ellipsizeMode ={'tail'}>{room.name + "(" + room.mealType + ")"}</Text>
                                );
                            })
                        }
                        
                        <View style={{flexDirection:'row'}}>                                
                            <Text
                                style={styles.price}>
                                {daysDifference} nights:
                                { currencySign} 
                                {rowData.roomsResults[0].price === undefined ? "" :
                                price}</Text>
                            {
                                rowData.roomsResults[0].price !== undefined
                                && (<LocPrice style={styles.price} fiat={fiat} fromParentType={1}/>)
                            }
                            {/* <Text style={styles.price}> (LOC {(((rowData.roomsResults[0].price) / this.props.locRate)*this.props.daysDifference).toFixed(2)})</Text> */}
                        </View>
                        {/* <Text style={styles.price}>{"1 night:" + Number(((parseFloat(rowData.roomsResults[0].price))).toFixed(2)) + " (" + rowData.roomsResults[0].price + "LOC)"}</Text> */}
                        
                        <Text style={styles.book}>Book Now</Text>
                    </CardView>
                </TouchableOpacity>
            );
        }
        return null;
    }


    _renderLoader() {
        return  <LTLoader isLockTripIcon opacity={'00'} style={{marginVertical:25}} />
    }


    _renderRooms() {
        const { rooms } = this.state;

        if (rooms == null || rooms.length == 0) {
            return (
                <Text style={{...commonText, width: '100%', textAlign: 'center',marginVertical: 10, color:'grey'}}>{lang.TEXT.NO_ROOMS}</Text>
            )
        } else {
            return (
                <View>
                    {
                        <View>
                            {
                                rooms.map((item, index) => {
                                    return this._renderRoom(item, index);
                                })
                            }
                        </View>
                    }
                </View>
            )            
        }
    }



    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Available Rooms</Text>
                {
                    this.state.isLoading
                        ? this._renderLoader()
                        : this._renderRooms()
                            
                }
            </View>
        );
    }

    // onRoomPress = (roomDetail) => {
    //     //console.log("onRoomPress", roomDetail, this.props);
    //     this.props.navigate('GuestInfoForm', { 
    //         roomDetail: roomDetail, 
    //         guests: this.props.guests, 
    //         'price': ((roomDetail.roomsResults[0].price) * this.props.daysDifference).toFixed(2),
    //         'priceLOC': (((roomDetail.roomsResults[0].price) / this.props.locRate)*this.props.daysDifference).toFixed(2), 
    //         'daysDifference': this.props.daysDifference,
    //         currency: this.props.currency,
    //         currencySign: this.props.currencySign,
    //         'hotelDetails': this.props.hotelDetails });
    // }
}

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        currencySign: state.currency.currencySign,
        
        currencyExchangeRates: state.exchangeRates.currencyExchangeRates,
    };
}

export default connect(mapStateToProps, null)(AvailableRoomsView);
// export default AvailableRoomsView;
