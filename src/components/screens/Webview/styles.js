import { StyleSheet } from 'react-native';
import { commonText } from '../../../common.styles';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: '#f0f1f3'
    },
    webviewContainer: {
        // flex: 1,
        position:'absolute',
        top: 1
    },
    backButtonContainer:{
        position: 'absolute',
        top: 0,
        width: '100%',
        paddingBottom:5,
        alignItems: 'flex-start',
        backgroundColor: '#0007',
    },
    backButtonText: {
        ...commonText
    },
    webView: {
        // marginTop: 10
    },
});
export default styles;
