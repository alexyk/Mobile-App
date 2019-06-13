import { StyleSheet } from 'react-native';
import { getSafeBottomOffset } from '../../../utils/designUtils';

export default StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 45+getSafeBottomOffset(),
        width: '100%',
        paddingBottom: getSafeBottomOffset(),
        paddingTop: 20,
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
        fontSize: 25,
        color: '#DA7B61'
    },
    inactiveIconStyle: {
        fontSize: 25,
        color: '#646467'
    },

    activeTextStyle: {
        fontSize: 8.5,
        fontFamily: 'FuturaStd-Light',
        color: '#DA7B61',
        marginTop: 6
    },
    inactiveTextStyle: {
        fontSize: 8.5,
        fontFamily: 'FuturaStd-Light',
        color: '#646464',
        marginTop: 6
    }

});
