import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

const styles = StyleSheet.create({
    info: {
        fontFamily: 'FuturaStd-Medium',
        color: '#fff',
        backgroundColor: '#A2C5BF',
        fontSize: getFontSize(16),
        textAlignVertical: "center"
    },
});

export default styles;
