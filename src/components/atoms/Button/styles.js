import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

const styles = StyleSheet.create({
    buttonWrap: {
        height: 48,
        borderRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignSelf: 'stretch'
    },
    buttonText: {
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        fontSize: getFontSize(16),
        fontFamily: 'FuturaStd-Light'
    }
});


export default styles;
