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
        flex: 0.89,
    },
    backButtonContainer:{
        flex: 0.11,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#FFF0',
    },
    backButtonText: {
        ...commonText,
        color: 'black',
        alignSelf:'center',
        paddingTop: 45,
        paddingLeft: 10,
        // backgroundColor: '#FF0',
    },
    webView: {
        // marginTop: 10
    },
});
export default styles;
