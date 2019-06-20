import {
    Dimensions,
    ScrollView,
    View,
    TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AvailableRoomsView from '../../../molecules/AvailableRoomsView';
import FacilitiesView from '../../../molecules/FacilitiesView';
import HotelDetailView from '../../../organisms/HotelDetailView';
import LocationView from '../../../atoms/LocationView';
import BackButton from '../../../atoms/BackButton';
import styles from './styles';
import ImageCarousel from '../../../atoms/ImagePage';
import { connect } from 'react-redux';
import { hotelSearchIsNative } from '../../../../config-settings';
import { getSafeTopOffset } from '../../../../utils/designUtils';
import { gotoWebview } from '../../utils';


class HotelDetails extends Component {
    static propTypes = {
        navigation: PropTypes.shape({
            navigate: PropTypes.func
        })
    }

    static defaultProps = {
        navigation: {
            navigate: () => { }
        }
    }

    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
        this.onFacilityMore = this.onFacilityMore.bind(this);

        const { params } = this.props.navigation.state;

        this.state = {
            hotel: params ? params.hotelDetail : [],
            guests: params ? params.guests : 0,
            searchString: params ? params.searchString : '',
            hotelFullDetails: params ? params.hotelFullDetails : [],
            hotelAmenities: params ? params.hotelFullDetails.hotelAmenities : [],
            mainAddress: params ? params.hotelFullDetails.additionalInfo.mainAddress : '',
            dataSourcePreview: params ? params.dataSourcePreview : [],
            regionName: params ? params.hotelFullDetails.city : '',
            countryName: params ? params.hotelFullDetails.country : '',
            description: params ? params.hotelFullDetails.generalDescription : '',
            latitude: params ? params.hotelFullDetails.latitude : 0.0,
            longitude: params ? params.hotelFullDetails.longitude : 0.0,
            hotelRatingStars: params ? params.hotelDetail.stars : 0,
            daysDifference: params ? params.daysDifference : 1,
            canLoadLocation: false
        }
    }


    componentDidMount() {
        // Temporary solution - improve loading time by delaying location
        // TODO: Improve suggestion - provide an image (screenshot of map) rather than a map component
        setTimeout(() => this.setState({canLoadLocation:true}), 1000);
    }


    onMapTap() {
        this.props.navigation.navigate('MapFullScreen', {
            lat: this.state.latitude != null ? parseFloat(this.state.latitude) : 0.0,
            lng: this.state.longitude != null ? parseFloat(this.state.longitude) : 0.0,
            name: this.state.hotel.name,
            address: `${this.state.mainAddress}, ${this.state.countryName}`
        });
    }

    onClose() {
        this.props.navigation.goBack();
    }

    onFacilityMore() {
    }

    onBooking = (roomDetail) => {
        if (hotelSearchIsNative.step3BookingDetails) {
            // onRoomPress = (roomDetail) => {
            //console.log("onRoomPress", roomDetail);
            let hotelImg = this.state.hotel.hotelPhoto.url;
            if (hotelImg === undefined || hotelImg === null) {
                hotelImg = this.state.hotel.hotelPhoto;
            }
            this.props.navigation.navigate('GuestInfoForm', { 
                roomDetail: roomDetail, 
                guests: this.state.guests, 
                price: ((roomDetail.roomsResults[0].price) * this.state.daysDifference).toFixed(2),
                daysDifference: this.props.daysDifference,
                hotelDetails: this.state.hotelFullDetails,
                searchString: this.state.searchString,
                hotelImg: hotelImg
            });
        } else {
            const {params} = this.props.navigation.state;
            const { hotel, searchString } = this.state;
            let webViewUrl = `mobile/hotels/listings/${hotel.id}${searchString}&quoteId=${roomDetail.quoteId}`
            const { token, email } = this.props.datesAndGuestsData;
            webViewUrl += `&authToken=${token}`;
            webViewUrl += `&authEmail=${email}`;
            
            console.log('ROOM DETAIL',{state:this.state,props:this.props,params,webViewUrl,roomDetail,searchString,cache:this.props.datesAndGuestsData});

            gotoWebview(this.state, this.props.navigation, {webViewUrl,message:'Processing booking ...'}, false);
        }
    } 

    _renderBackButton() {
        return (
            <View style={styles.topButtonContainer}>
                <BackButton onPress={this.onClose} isWhite style={styles.backButton} />
            </View>
        )
    }


    _renderImages() {
        const {width, height} = Dimensions.get('window');
        const logoWidth = width;
        const logoHeight = (height * 0.3 + getSafeTopOffset());

        //console.log('logo dim',{logoHeight,logoWidth})
        return (
            <View style={{ width: logoWidth, height: logoHeight }}>
                <ImageCarousel
                    delay={5000}
                    style={styles.logoImage}
                    width={logoWidth}
                    height={logoHeight}
                    indicatorSize={12.5}
                    indicatorOffset={20}
                    indicatorColor="#D87A61"
                    images={this.state.dataSourcePreview}
                />
            </View>
        )
    }


    _renderHotelDetails() {
        const {
            dataSourcePreview, hotel, mainAddress, description
        } = this.state;

        const { name, star } = hotel;

        return (
            <HotelDetailView
                dataSourcePreview={dataSourcePreview}
                title={name}
                rateVal={star}
                reviewNum={0}
                address={mainAddress}
                description={description}
            />
        )
    }


    _renderFacilities() {
        return [
            <FacilitiesView
                key={'facility_view'}
                style={styles.roomfacility}
                data={this.state.hotelAmenities}
                isHome={false}
                onFacilityMore={this.onFacilityMore}
            />,

            <View key={'facility_separator1'} style={[styles.lineStyle, {
                marginLeft: 20, marginRight: 20, marginTop: 15, marginBottom: 15
            }]}
            />
	    ]
    }

    _renderAvailableRooms() {
        return [
            <AvailableRoomsView
                key={'facility_rooms'}
                id={`${this.state.hotel.id}`}
                search={this.state.searchString}
                onBooking={this.onBooking}
                guests={this.state.guests}
                hotelDetails={this.state.hotelFullDetails}
                daysDifference={this.state.daysDifference}
            />,

            <View key={'facility_separator2'} style={[styles.lineStyle, {
                marginLeft: 20, marginRight: 20, marginTop: 15, marginBottom: 15
            }]}
            />
        ]
    }


    _renderLocation() {
        if (this.state.canLoadLocation) {
            return (
                <TouchableOpacity activeOpacity={1} onPress={() => this.onMapTap()}>
                    <LocationView
                        location={`${this.state.mainAddress}, ${this.state.countryName}`}
                        titleStyle={{ fontSize: 17 }}
                        name={this.state.hotel.name}
                        description={this.state.hotel.generalDescription}
                        lat={this.state.latitude != null ? parseFloat(this.state.latitude) : 0.0}
                        lon={this.state.longitude != null ? parseFloat(this.state.longitude) : 0.0}
                        radius={200}
                    />
                </TouchableOpacity>
            )
        } else {
            return null;
        }
    }


    render() {
        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.body}>
                        { this._renderImages() }

                        { this._renderHotelDetails() }

                        { this._renderFacilities() }

                        { this._renderAvailableRooms() }

                        { this._renderLocation() }

                        <View style={{ marginBottom: 50 }} />
                    </View>
                </ScrollView>
                
                { this._renderBackButton() }
            </View>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        datesAndGuestsData: state.userInterface.datesAndGuestsData,
    };
}

export default connect(mapStateToProps)(HotelDetails);