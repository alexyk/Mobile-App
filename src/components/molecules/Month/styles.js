import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

export default StyleSheet.create({
    month: {
        paddingTop: 5,
        paddingBottom: 7
    },
    monthTitle: {
        paddingHorizontal: 10
    },
    monthTitleText: {
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(18),
        lineHeight: 20,
    },
    dayRow: {
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'stretch',
        alignItems: 'center',
        paddingVertical: 5
    }
});

