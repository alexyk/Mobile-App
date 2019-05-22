import { StyleSheet, Dimensions } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

const dimensionWindows = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems:'center',
        width: (dimensionWindows.width - 40) / 5,
        marginTop:5
    },

    detailImage: {
        width:22,
        height:22,
    },

    detailView: {
        flexDirection:'row',
        marginTop:5,
    },

    detailText: {
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(12),
        color:'#56595c',
    },

    detailTopText: {
      fontFamily: 'FuturaStd-Light',
      fontSize: getFontSize(6),
      color:'#56595c',
    }
});

export default styles;
