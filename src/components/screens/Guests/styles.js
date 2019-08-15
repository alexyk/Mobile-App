import { StyleSheet } from 'react-native';
import { getSafeTopOffset, getSafeBottomOffset } from '../../../utils/designUtils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#f0f1f3',
        marginTop: getSafeTopOffset(),
        marginBottom: getSafeBottomOffset()
    },

    bodyRows: {
        flex: 1,
        flexDirection: 'column',
    },

    doneButtonText: {
        color: '#ffffff',
        fontFamily: 'FuturaStd-Light',
        fontSize: 17,
    },
    ChildText:{
        fontFamily: 'futura',
        fontSize: 17,
        marginLeft: 15,
    },
    doneButtonView: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        backgroundColor: '#DA7B61',
        justifyContent: 'center',
        alignItems: 'center',
        height:50,
    },

    bottomView: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        padding:10,
        height:70,
    },

    withChildrenCheckbox: {
        height: 15,
        width: 15,
        marginLeft: 15,
        marginVertical: 10
    }
});

export default styles;
