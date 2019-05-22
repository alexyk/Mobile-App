import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },

    title: {
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(15),
        color:'#000000'
    },

    detail: {
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(12),
        color:'#54585b',
        marginTop:5,
    }
});

export default styles;
