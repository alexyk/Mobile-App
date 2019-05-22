import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

export default StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: 180,
        width: 165,
        marginTop: 12,
        backgroundColor: '#ffffff'
    },
    favoriteView: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 6,
        zIndex: 1
    },
    favoriteText: {
        color: '#fff',
        fontSize: getFontSize(18)
    },
    locationText: {
        fontSize: getFontSize(8.5),
        fontFamily: 'FuturaStd-Light',
        padding: 5,
        paddingBottom: 0
    },
    nameText: {
        fontSize: getFontSize(15.5),
        fontFamily: 'FuturaStd-Light',
        padding: 5,
        paddingBottom: 0
    },
    reviewText: {
        fontSize: getFontSize(9),
        fontFamily: 'FuturaStd-Light',
        padding: 5,
        paddingTop: 0
    },
    costText: {
        fontSize: getFontSize(10.5),
        fontFamily: 'FuturaStd-Light',
        padding: 5
    }
});
