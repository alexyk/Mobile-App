import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

export default StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 55,
        width: '100%',
        backgroundColor: '#fff'
    },
    tab: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10
    },
    activeIconStyle: {
        fontSize: getFontSize(25),
        color: '#DA7B61'
    },
    inactiveIconStyle: {
        fontSize: getFontSize(25),
        color: '#646467'
    },

    activeTextStyle: {
        fontSize: getFontSize(8.5),
        fontFamily: 'FuturaStd-Light',
        color: '#DA7B61',
        marginTop: 6
    },
    inactiveTextStyle: {
        fontSize: getFontSize(8.5),
        fontFamily: 'FuturaStd-Light',
        color: '#646464',
        marginTop: 6
    }

});
