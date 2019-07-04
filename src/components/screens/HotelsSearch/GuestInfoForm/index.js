import React, {Component} from 'react';
import {
    View, Text, FlatList, KeyboardAvoidingView, BackHandler,
    Platform
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
import Separator from '../../../atoms/Separator';
import StringUtils from '../../../../services/utilities/stringUtilities';
import TopBar from '../../../molecules/TopBar';
import { setGuestData } from '../../../../redux/action/hotels';
import lang from '../../../../language'


class GuestInfoForm extends Component {
    constructor(props) {
        super(props);
        
        const { guestData } = props; // retrieve from redux cache
        const { params } = props.navigation.state;

        // Save guests array for dynamic form generation
        this.state = {
            isLoading: true,
            isConfirmed: false,
            scMode: false,
            buttonLabel: 'Loading ...',
            
            guests : (guestData ? guestData.concat() : null),
            roomType: lang.TEXT.WAITING_FOR_RESERVATION_CREATION,
            datesText: lang.TEXT.WAITING_FOR_RESERVATION_CREATION,
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

        this._bookingParams = null;
        this._guestsCollection = [];
        const guestsCount = (params.guests);
        for (let i=0; i<guestsCount; i++) {
            this._guestsCollection.push({title:'Mr', firstName:'', lastName: ''});
        }

        this.serviceRequestSCMode = this.serviceRequestSCMode.bind(this);
        this._onGuestTitleUpdate = this._onGuestTitleUpdate.bind(this);
        this._onFirstNameChange = this._onFirstNameChange.bind(this);
        this._onLastNameChange = this._onLastNameChange.bind(this);
        this._onBackPress = this._onBackPress.bind(this);
        this._onWebviewRightPress = this._onWebviewRightPress.bind(this);
    }

    componentWillMount() {
        const { quoteId } = this.props.navigation.state.params.roomDetail;
        const { currency } = this.props;
        this.prepareGuestsData();
        this.serviceCreateReservation(quoteId, currency, this._guestsCollection.concat());

        if (Platform.OS == 'android') {
            BackHandler.addEventListener('hardwareBackPress', this._onBackPress);
        }
    }

    componentDidMount() {
        WebsocketClient.stopGrouping();
    }

    componentWillUnmount() {
        WebsocketClient.startGrouping();
        if (Platform.OS == 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this._onBackPress);
        }
    }


    async prepareGuestsData() {
        const { guests } = this.state;
        var preparedGuests = [];

        if (guests != null) {
            this._guestsCollection = guests.concat(); // retrieved from cache in constructor
            this.setState({isLoading: false});
        } else {
            const { guests: guestsCount } = this.props.navigation.state.params;

            let userFirstName = await userInstance.getFirstName();
            let userLastName = await userInstance.getLastName();
            // let userGender = await userInstance.getGender();

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

                this._onFirstNameChange(i, firstName, true);
                this._onLastNameChange(i, lastName, true);
            }
            
            this.setState({guests: preparedGuests, isLoading: false});
        }
    }


    serviceRequestSCMode() {
        requester.getConfigVarByName(SC_NAME)
            .then((res) => {
                if (res.success) {
                    res.body.then((data) => {
                        this.setState({
                            scMode: (data.value === 'true')
                        });
                        const { currency } = this.props;
                        const { quoteId } = this.props.navigation.state.params.roomDetail;
                        const resParams = {
                            quoteId, currency,
                            guestRecord: this._guestsCollection.concat()
                        }
                        this.gotoWebViewPayment(resParams)
                    });
                } else {
                    res.errors.then((error) => {
                        processError(`[GuestInfoForm] SC mode error level 2 - ${error.message}`,{error});
                    });
                }
            })
            .catch(error => processError(`[GuestInfoForm] SC mode error level 1 - ${error.message}`,{error}));
    }


    serviceCreateReservation(quoteId, currency, guestRecord) {
        const value = {
            quoteId, currency,
            rooms: [{
                adults: guestRecord,
                'children': []
            }],
        };
        this.setState({isLoading:true, buttonLabel: 'Processing ...'});


        clog(`Creating reservation`, value);

        requester.createReservation(value).then(res => {
            if (res && res.success) {
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
                                            roomType: data.booking.hotelBooking[0].room.roomType.text,
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
                                            isConfirmed: true,
                                            buttonLabel: 'Proceed'
                                        }, () => {
                                            const { currencyExchangeRates } = this.props.exchangeRates;
                                            const fiatPriceRoomsXML = params.price;
                                            const fiatPriceRoomsXMLInEur = currencyExchangeRates && CurrencyConverter.convert(currencyExchangeRates, RoomsXMLCurrency.get(), DEFAULT_CRYPTO_CURRENCY, fiatPriceRoomsXML);
                                            this.props.setLocRateFiatAmount(fiatPriceRoomsXMLInEur);
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
                this.props.navigation.goBack();
            });
            processError(`[GuestInfoForm] Error in creating reservation level 1 - ${error.message}`, {error});
        });
    }


    gotoWebViewPayment() {
        const { searchString, quoteId } = this.props.navigation.state.params;
        const { bookingId, booking } = this.state;
        const { currency } = this.props;
        const { token, email } = this.props.loginDetails;
        const rooms = (  JSON.stringify(booking.rooms)  );
        const search = StringUtils.subBeforeIndexOf(searchString, '&rooms=') +
            `&quoteId=${quoteId}&rooms=${rooms}&authToken=${token}&authEmail=${email}`;
        const state = { currency, token, email };
        const extra = {
            webViewUrl: `mobile/hotels/listings/book/${bookingId}/confirm${search}`,
            message: 'Preparing booking payment ...',
            backText: '',
            rightText: "Back To Hotel Details",
            onRightPress: this._onWebviewRightPress
        };
        gotoWebview(state, this.props.navigation, extra);
    }


    _onWebviewRightPress() {
        this.props.navigation.pop(2);
    }


    _onGuestTitleUpdate(index, title) {
        this._guestsCollection[index].title = title;
        this.props.setGuestData(this._guestsCollection.concat());
    }


    _onFirstNameChange(key, text, isInit){
        if (text === "") {
            text = "Optional"
        }
        
        this._guestsCollection[key].firstName = text;
        
        if (!isInit) {
            this.props.setGuestData(this._guestsCollection.concat());
        }
    }

    _onLastNameChange(key, text, isInit=false) {
        if (text === "") {
            text = "Optional"
        }
        this._guestsCollection[key].lastName = text;

        if (!isInit) {
            this.props.setGuestData(this._guestsCollection.concat());
        }
    }

    
    onProceedPress = () => {
        if (this.state.isLoading) {
            return;
        }
        let isValid = true;
        this.setState({datesText: 'loading ...', roomType: 'loading ...', isLoading: true});

    
        for(let item of this._guestsCollection) {
            if (!hasLetter(item['firstName']) || !hasLetter(item['lastName'])) {
                isValid = false;
                break;
            }
        }

        if (this._guestsCollection.length != this.state.guests.length) {
            this.refs.toast.show("Please enter details for all the guests", 2000);
        }
        else if (!isValid) {
            this.refs.toast.show("Names should be at least 1 characters long and contain only characters.", 2000);
        }
        else {
            this.serviceRequestSCMode()
        }
        
    }


    _onBackPress() {
        this.props.navigation.goBack();
        if (Platform.OS == 'android') {
            return true;
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
                    <Text style={styles.hotelAddress}>{additionalInfo.mainAddress}</Text>
                </View>
            </View>
        )
    }


    _renderRoomType() {
        return (
            <View style={styles.listItem}>
                <View style={styles.listItemNameWrapper}>
                    <Text style={styles.listItemText}>Room Type</Text>
                </View>
                <View style={styles.listItemValueWrapper}>
                    <Text style={styles.valueText}>{this.state.roomType}</Text>
                </View>
            </View>
        )
    }


    _renderDates() {
        const { arrivalDate, leavingDate, datesText } = this.state;
        const text = (
            (arrivalDate != null && leavingDate != null)
                ? `${arrivalDate} - ${leavingDate}`
                : datesText
        )
        return (
            <View style={styles.listItem}>
                <View style={styles.listItemNameWrapper}>
                    <Text style={styles.listItemText}>Dates</Text>
                </View>
                <View style={styles.listItemValueWrapper}>
                    <Text style={styles.valueText}>{text}</Text>
                </View>
            </View>
        )
    }


    _renderGuestsCount(guestsCount) {
        return (
            <View style={styles.listItem}>
                <View style={styles.listItemNameWrapper}>
                    <Text style={styles.listItemText}>Guests</Text>
                </View>
                <View style={styles.listItemValueWrapper}>
                    <Text style={styles.valueText}>{guestsCount}</Text>
                </View>
            </View>
        )
    }


    _renderGuests() {
        //clog('guests-render',`${this.state.guests.length} guests currently in state`, {guests:this.state.guests})
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
                            onGuestTitleUpdate={this._onGuestTitleUpdate}
                            onFirstNameChange={this._onFirstNameChange}
                            onLastNameChange={this._onLastNameChange}
                        />
                    </KeyboardAvoidingView>
                )}
            />
        )
    }


    render() {
        const { params }                                    = this.props.navigation.state;
        const { price, daysDifference, guests:guestsCount } = params;
        const { buttonLabel, isLoading }                    = this.state;

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
                <TopBar onBackPress={this._onBackPress} />
                <Separator height={10} />
                <BookingSteps items={lang.TEXT.BOOKING_STEPS} selectedIndex={0} />
                <Separator height={10} />
                
                <View style={styles.content}>
                    <Text style={styles.heading}>Provide guest information</Text>
                    
                    { this._renderHotelInfo(params) }
                    <Separator height={20} />
                    { this._renderRoomType() }
                    { this._renderDates() }
                    { this._renderGuestsCount(guestsCount) }
                    <Separator height={10} />
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
        guestData: state.hotels.guestData,
    };
}

const mapDispatchToProps = dispatch => ({
    setLocRateFiatAmount : bindActionCreators(setLocRateFiatAmount , dispatch),
    setGuestData : bindActionCreators(setGuestData , dispatch),
})
export default connect(mapStateToProps, mapDispatchToProps)(GuestInfoForm);


/*
const params = this.props.navigation.state.params;
            this._bookingParams = {
                roomDetails : params.roomDetail, 
                hotelDetails: params.hotelDetails,
                price: params.price, 
                daysDifference: params.daysDifference,
                guests: this._guestsCollection.length,
                quoteId: params.roomDetail.quoteId, 
                guestRecord: this._guestsCollection.concat(),
                searchString: params.searchString,
                hotelImg: params.hotelImg
            };
            // this.props.navigation.navigate('RoomDetailsReview', params);
            this.serviceCreateReservation(this._bookingParams);*/