import { StyleSheet } from 'react-native';
import { getSafeBottomOffset } from '../../../utils/designUtils';

export default StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 80+getSafeBottomOffset(),
        width: '100%',
        paddingBottom: getSafeBottomOffset(),
        paddingTop: 20,
        // backgroundColor: '#fff'
        backgroundColor: '#fff'
    }
});
