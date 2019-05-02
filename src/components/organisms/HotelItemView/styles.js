import { StyleSheet, Dimensions, Platform } from 'react-native';
import { commonText } from '../../../common.styles'

const dimensions = Dimensions.get('window');
const imageHeight = Math.round(dimensions.width * 0.25);
const imageWidth = Math.round(dimensions.width * 0.32);

const styles = StyleSheet.create({
    
    card: {
        flexDirection: 'row',
        marginLeft: 15,
        marginRight: 15,
        marginTop: 7.5,
        marginBottom: 7.5,
        paddingRight: 10,
        height: imageHeight,
        borderRadius: 15,
        backgroundColor: 'white',    
    },
    popularHotelsImage: {
        height: imageHeight, 
        width: imageWidth,
    },
    favoritesButton: {
        position: 'absolute',
        height: 20, 
        width: 20,
        top: 5,
        right: 5
    },
    index: {
        position: 'absolute',
        borderRadius: 15,
        paddingHorizontal: 7,
        paddingTop: 5,
        paddingBottom: (Platform.OS == 'android' ? 5 : 2),
        backgroundColor: "#a3c5c050",
        bottom: 33,
        right: 0
    },
    indexText: {
        ...commonText,
        fontSize: 14,
        color: "#FFFFFF",
    },
    favoriteIcon: {
        height: 20,
        width: 20
    },
    cardContent: {
        flex: 1,
    },
    placeName: {
        ...commonText,
        marginTop: 8,
        marginLeft: 8,
        fontSize: 18,
        color: 'black',
        fontWeight: '100',
    },
    aboutPlaceView: {
        marginLeft: 8,
        flexDirection: 'row',
        marginTop: 4
    },
    placeReviewText: {
        ...commonText,
        fontSize: 12,
        color: '#aeaeae'
    },
    placeReviewNumber: {
        ...commonText,
        fontSize: 12,
        color: '#aeaeae'
    },
    totalReviews: {
        ...commonText,
        fontSize: 12,
        color: '#aeaeae'
    },
    ratingIconsWrapper: {
        flexDirection: 'row'
    },
    costView: {
        width: '100%',
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    cost: {
        ...commonText,
        color: 'black',
        fontSize: 12,
        textAlign: 'right',
        width: "100%"
    },
    costLoc: {
        ...commonText,
        color: 'black',
        fontSize: 12,
        marginLeft: 5
    },
    perNight: {
        ...commonText,
        fontSize: 12,
        color: 'black',
    },
    star: {
        height: 8,
        width: 8,
        marginTop: 2
    },
});

export default styles;
