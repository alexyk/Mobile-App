import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    month: {
        paddingTop: 5,
        paddingBottom: 17
    },
    monthTitle: {
        paddingHorizontal: 10
    },
    monthTitleText: {
        fontFamily: 'FuturaStd-Light',
        fontSize: 20,
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

