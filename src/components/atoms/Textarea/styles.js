import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 170,
    },
    count: {
        position: 'absolute',
        bottom: 8,
        right: 2,
        fontSize: getFontSize(14),
        color: '#ccc',
        fontFamily: 'FuturaStd-Light',
    }
});

export default styles;
