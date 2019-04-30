import { StyleSheet } from 'react-native';
import { commonText } from '../../../common.styles';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f1f3'
    },
    container: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: '#f0f1f3'
    },
    webviewContainer: {
        flex: 0.89,
    },
    backButton: {
        marginLeft: 10,
        // backgroundColor: 'pink',
    },
    backButtonImage: {
        // backgroundColor: 'yellow',
    },
    backButtonContainer:{
        flex: 0.11,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#FFF8',
    },
    title: {
        ...commonText,
        color: 'black',
        marginTop: 25,
        marginLeft: 20,
        fontSize: 20
        // backgroundColor: 'red',
    },
    backText: {
        ...commonText,
        color: 'black',
        marginTop: 35,
        marginLeft: 10,
        fontSize: 14
        // backgroundColor: 'red',
    },
    webView: {
    },
});
export default styles;
