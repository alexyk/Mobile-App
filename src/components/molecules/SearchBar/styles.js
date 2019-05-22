import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

export default StyleSheet.create({
    leftIconView: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
    },
    leftIconText: {
        color: '#5a5a5c',
        fontSize: getFontSize(16)
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#fff',
        height: 50
    },
    input: {
        flex: 1,
        marginLeft: -3,
        marginRight: 20,
        marginTop:0,
        color: '#000',
        fontSize: getFontSize(17),
        fontFamily: 'FuturaStd-Light',
        textAlignVertical: "center"
    },
    input_disable: {
        flex: 1,
        marginLeft: -3,
        marginRight: 20,
        marginTop:0,
        color: '#d9d9d9',
        fontSize: getFontSize(17),
        fontFamily: 'FuturaStd-Light',
        textAlignVertical: "center"
    }
});
