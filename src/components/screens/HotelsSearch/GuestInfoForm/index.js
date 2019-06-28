import React, {Component} from 'react';
import {
    View, Text, FlatList, KeyboardAvoidingView
} from 'react-native';

import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { hasLetter } from '../../../../utils/validation';
import { CurrencyConverter } from '../../../../services/utilities/currencyConverter'
import { RoomsXMLCurrency } from '../../../../services/utilities/roomsXMLCurrency'
import { setLocRateFiatAmount } from '../../../../redux/action/exchangeRates';
import requester from '../../../../initDependencies';
import { userInstance } from '../../../../utils/userInstance';
import { imgHost } from '../../../../config'
import { SC_NAME, DEFAULT_CRYPTO_CURRENCY } from '../../../../config-settings';
import { processError, rlog, clog } from '../../../../config-debug';
import { gotoWebview } from '../../utils';
import { WebsocketClient } from '../../../../utils/exchangerWebsocket';

import Image from 'react-native-remote-svg';
import GuestFormRow from './GuestFormRow';
import styles from './styles';
import Toast from 'react-native-easy-toast';
import HotelDetailBottomBar from '../../../atoms/HotelDetailBottomBar'
import BookingSteps from '../../../molecules/BookingSteps';
import BackButton from '../../../atoms/BackButton';
import Separator from '../../../atoms/Separator';
import StringUtils from '../../../../services/utilities/stringUtilities';


class GuestInfoForm extends Component {
    constructor(props) {
        super(props);
        
        const { params } = props.navigation.state;

        // Save guests array for dynamic form generation
        this.state = {
            isLoading: true,
            scMode: false,
            buttonLabel: 'Proceed',
            
            guests : [],
            roomName: null,
            arrivalDate: null,
            leavingDate: null,
            cancelationDate: null,
            creationDate: null,
            cancellationPrice: null,
            bookingId: null,
            hotelBooking: null,
            booking: null,
            data: null,
        };

        this.bookingParams = null;
        this.guestsCollection = [];
        const guestsCount = (params.guests);
        for (let i=0; i<guestsCount; i++) {
            this.guestsCollection.push({title:'Mr', firstName:'', lastName: ''});
        }

        this.onFirstNameChange = this.onFirstNameChange.bind(this);
        this.onLastNameChange = this.onLastNameChange.bind(this);
    }

    componentWillMount() {
        this.prepareGuestsData();
        this.serviceRequestSCMode();
    }

    componentDidMount() {
        WebsocketClient.stopGrouping();
    }

    componentWillUnmount() {
        WebsocketClient.startGrouping();
    }

    async prepareGuestsData() {
        let userFirstName = await userInstance.getFirstName();
        let userLastName = await userInstance.getLastName();
        // let userGender = await userInstance.getGender();

        const { guests: guestsCount } = this.props.navigation.state.params;

        var preparedGuests = [];
        for (var i = 0; i < guestsCount; i++){
            let firstName = '';
            let lastName = '';
            if (i == 0) {
                if (userFirstName != null) firstName = userFirstName;
                if (userLastName != null) lastName = userLastName;
            }

            preparedGuests.push({
                key: `${i}`,
                title: 'Mr',
                firstName,
                lastName
            });

            this.onFirstNameChange(i, firstName);
            this.onLastNameChange(i, lastName);
        }

        
        rlog(`'prepare-guests`,`Guests to state`, {guests: preparedGuests});

        this.setState({guests: preparedGuests, isLoading: false});
    }


    serviceRequestSCMode = () => {
        requester.getConfigVarByName(SC_NAME)
            .then((res) => {
                if (res.success) {
                    res.body.then((data) => {
                        this.setState({
                            scMode: (data.value === 'true')
                        });
                    });
                } else {
                    res.errors.then((error) => {
                        processError(`[GuestInfoForm] SC mode error level 2 - ${error.message}`,{error});
                    });
                }
            })
            .catch(error => processError(`[GuestInfoForm] SC mode error level 1 - ${error.message}`,{error}));
    }


    serviceCreateReservation(params) {
        const value = {
            quoteId: params.quoteId,
            rooms: [{
                adults: params.guestRecord
                ,
                'children': []
            }],
            'currency': params.currency
        };
        this.setState({isLoading:true, buttonLabel: 'Processing ...'})

        requester.createReservation(value).then(res => {
            if (res.success) {
                rlog('case 1')
                res.body.then(data => {
                    rlog('case 2')
                    // console.log("createReservation  ---", data)
                    const quoteBookingCandidate = { bookingId: data.preparedBookingId };
                    requester.quoteBooking(quoteBookingCandidate)
                        .then((res) => {
                            rlog('case 3')
                            res.body
                                .then(success => {
                                    if (success.is_successful_quoted) {
                                        const bookingId = data.preparedBookingId;
                                        const hotelBooking = data.booking.hotelBooking[0];
                                        const startDate = moment(data.booking.hotelBooking[0].creationDate, 'YYYY-MM-DD');
                                        const endDate = moment(data.booking.hotelBooking[0].arrivalDate, 'YYYY-MM-DD');
                                        const leavingDate = moment(data.booking.hotelBooking[0].arrivalDate, 'YYYY-MM-DD').add(data.booking.hotelBooking[0].nights, 'days');
                                        this.setState({
                                            roomName: data.booking.hotelBooking[0].room.roomType.text,
                                            arrivalDate: endDate.format('DD MMM'),
                                            leavingDate: leavingDate.format('DD MMM'),
                                            cancelationDate: endDate.format('DD MMM YYYY'),
                                            creationDate: startDate.format('DD MMM'),
                                            cancellationPrice: data.fiatPrice,
                                            bookingId: bookingId,
                                            hotelBooking: hotelBooking,
                                            booking: value,
                                            data,
                                            isLoading: false,
                                            buttonLabel: 'Proceed'
                                        }, () => {
                                            const { currencyExchangeRates } = this.props.exchangeRates;
                                            const fiatPriceRoomsXML = params.price;
                                            const fiatPriceRoomsXMLInEur = currencyExchangeRates && CurrencyConverter.convert(currencyExchangeRates, RoomsXMLCurrency.get(), DEFAULT_CRYPTO_CURRENCY, fiatPriceRoomsXML);
                                            this.props.setLocRateFiatAmount(fiatPriceRoomsXMLInEur);
                                            this.onReservationReady();
                                        });
                                        rlog('case 4')
                                    } else {
                                        this.props.navigation.navigation.pop(3);
                                        rlog('case 5')
                                    }
                                })
                                .catch(error => rlog(`case 6 - ${error.message}`));
                        })
                        .catch(error => rlog(`case 7 - ${error.message}`));

                }).catch((error) => {
                    rlog(`case 8 - ${error.message}`);
                    processError(`[GuestInfoForm] Error in creating reservation level 2.1 - ${error.message}`, {error});
                });
            }
            else {
                res.errors.then(data => {
                    const errors = data.errors;
                    if (errors.hasOwnProperty('RoomsXmlResponse')) {
                        if (errors['RoomsXmlResponse'].message.indexOf('QuoteNotAvailable:') !== -1) {
                            this.refs.toast.show(data.errors.RoomsXmlResponse.message, 5000, () => {
                                this.props.navigation.pop(3);
                            });
                        }
                    } else {
                        for (let key in errors) {
                            if (typeof errors[key] !== 'function') {
                                this.refs.toast.show(errors[key].message, 5000);
                            }
                        }
                    }
                });
            }
        }).catch((error) => {
            this.refs.toast.show("Unknown Error! Please try again.", 5000, () => {
                console.log(`this`,this)
                this.props.navigation.goBack();
            });
            processError(`[GuestInfoForm] Error in creating reservation level 1 - ${error.message}`, {error});
        });
    }


    gotoWebViewPayment(params) {
        const { bookingId, booking } = this.state;
        const { searchString, quoteId } = params;
        const { id:hotelBookingId, hotelId } = this.state.data.booking.hotelBooking[0];
        const { currency } = this.props;
        const { token, email } = this.props.loginDetails;
        const rooms = (  JSON.stringify(booking.rooms)  );
        const search = StringUtils.subBeforeIndexOf(searchString, '&rooms=') +
            `&quoteId=${quoteId}&rooms=${rooms}&authToken=${token}&authEmail=${email}`;
        const state = { currency, token, email };
        const extra = {
            webViewUrl: `mobile/hotels/listings/book/${bookingId}/confirm${search}`,
            message: 'Preparing booking payment ...',
            backText: 'Back'
        };
        gotoWebview(state, this.props.navigation, extra);
    }

    onFirstNameChange(...args){
        let key=args[0],text=args[1];

        rlog(`first-name`,`${key} -> ${text}`,{args})

        if (text === "") {
            text = "Optional"
        }
        
	    this.guestsCollection[key].firstName = text;
    }

    onLastNameChange(key,text){
        if (text === "") {
            text = "Optional"
        }
        this.guestsCollection[key].lastName = text;
    }

    onReservationReady() {
        rlog('hello',`onReservationReady`,{bookingParams:this.bookingParams})
        this.gotoWebViewPayment(this.bookingParams);
    }

    
    onProceedPress = () => {
        if (this.state.isLoading) {
            return;
        }
        let isValid = true;

        rlog(`guests`,`Guests ${this.guestsCollection.length}`, {guestsCollection:this.guestsCollection,stateGuests:this.state.guests});

        for(let item of this.guestsCollection) {
            if (!hasLetter(item['firstName']) || !hasLetter(item['lastName'])) {
                isValid = false;
                break;
            }
        }

        if (this.guestsCollection.length != this.state.guests.length){
            this.refs.toast.show("Please enter details for all the guests", 2000);
        }
        else if (!isValid) {
            this.refs.toast.show("Names should be at least 1 characters long and contain only characters.", 2000);
        }
        else {
            const params = this.props.navigation.state.params;
            this.bookingParams = {
                roomDetails : params.roomDetail, 
                quoteId: params.roomDetail.quoteId, 
                hotelDetails: params.hotelDetails, 
                price: params.price, 
                daysDifference: params.daysDifference,
                guests: this.guestsCollection.length,
                guestRecord: this.guestsCollection,
                searchString: params.searchString,
                hotelImg: params.hotelImg
            };
            //this.props.navigation.navigate('RoomDetailsReview', bookingParams);
            this.serviceCreateReservation(this.bookingParams);
        }
        
    }


    _renderHotelInfo(params) {
        const { hotelImg, hotelDetails } = params;
        const { name, additionalInfo } = hotelDetails;

        return (

            <View style={styles.hotelInfoContainer}>
                <View style={styles.hotelThumbView}>
                    <Image source={{uri: imgHost + hotelImg}} style={styles.hotelThumb} />
                </View>
                <View style={styles.hotelInfoView}>
                    <Text style={styles.hotelName}>{name}</Text>
                    <Text style={styles.hotelPlace}>{additionalInfo.mainAddress}</Text>
                </View>
            </View>
        )
    }


    _renderGuests() {
        rlog('guests-render',`${this.state.guests.length} guests currently in state`, {guests:this.state.guests})
        return (
            <FlatList
                style={styles.flatList}
                data={this.state.guests}
                
                keyExtractor={(item, index) => item.key}
                renderItem={({ item, index }) => (
                    <KeyboardAvoidingView keyboardVerticalOffset={-50} behavior="position" enabled>
                        <GuestFormRow
                            guest={item}
                            itemIndex={index}
                            onFirstNameChange={this.onFirstNameChange}
                            onLastNameChange={this.onLastNameChange}
                        />
                    </KeyboardAvoidingView>
                )}
            />
        )
    }


    render() {
        const { params }                    = this.props.navigation.state;
        const { price, daysDifference }     = params;
        const { buttonLabel, isLoading }    = this.state;

        return (
            <View style={styles.container}>
                <Toast
                    ref="toast"
                    style={{ backgroundColor: '#DA7B61' }}
                    position='bottom'
                    positionValue={150}
                    fadeInDuration={500}
                    fadeOutDuration={500}
                    opacity={1.0}
                    textStyle={{ color: 'white', fontFamily: 'FuturaStd-Light' }}
                />
                <BackButton onPress={() => {this.props.navigation.goBack()}} />
                <Separator height={10} />
                <BookingSteps items={['1. Provide Guest Information','2. Review Room Detail','3. Confirm and Pay']} selectedIndex={0} />
                <Separator height={10} />
                
                <View style={styles.content}>
                    <Text style={styles.heading}>Provide guest information</Text>
                    
                    { this._renderHotelInfo(params) }
                    { this._renderGuests() }
                    
                </View>

                <HotelDetailBottomBar 
                    price={price}
                    daysDifference={daysDifference}
                    titleBtn={buttonLabel}
                    onPress={this.onProceedPress}
                    isDisabled={isLoading}
                />
            </View>
            
        )
    }
}

GuestInfoForm.defaultProps = {
    hotelName: '',
    hotelAddress: '',
    priceInUserCurreny : NaN,
    priceInLoc : NaN,
    quoteId: '',
    roomDetail:{},
    guests : 0,
    guestsArray: []
}

GuestInfoForm.propTypes = {
    hotelName: PropTypes.string,
    hotelAddress: PropTypes.string,
    priceInUserCurreny : PropTypes.number,
    priceInLoc : PropTypes.number,
    quoteId: PropTypes.string,
    roomDetail: PropTypes.object,
    guests : PropTypes.number
};

const mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        currencySign: state.currency.currencySign,
        
        isLocPriceWebsocketConnected: state.exchangerSocket.isLocPriceWebsocketConnected,
        locAmounts: state.locAmounts,
        exchangeRates: state.exchangeRates,

        loginDetails: state.userInterface.login,
    };
}

const mapDispatchToProps = dispatch => ({
    setLocRateFiatAmount : bindActionCreators(setLocRateFiatAmount , dispatch),
})
export default connect(mapStateToProps, mapDispatchToProps)(GuestInfoForm);
