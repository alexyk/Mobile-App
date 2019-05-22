import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

const styles = StyleSheet.create({
    container: {
      flexDirection:'column',
    },

    topView: {
        backgroundColor: '#ffffff',
        marginTop:-20,
        marginLeft:15,
        marginRight:15,
        paddingBottom:10
    },

    topTitleText:{
        fontFamily: 'futura',
        fontSize: getFontSize(19),
        marginTop:5,
        marginLeft:10,
        marginRight:10,
        color:'#000000'
    },

    rateViewContainer: {
        flexDirection: 'row',
        marginLeft:10,
        marginRight:10,
    },

    rateText:{
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(9),
        color:'#898c8d',
        marginRight: 5,
    },

    addressText: {
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(10),
        marginTop:3,
        marginBottom:2,
        marginLeft:10,
        marginRight:10,
        color:'#000',
    },

    lineStyle:{
        borderWidth:0.3,
        borderColor:'#cccccc',
        margin:7,
    },

    detailsStyle: {
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop:5,
        marginLeft:5,
        marginRight:5,
    },

    normalText:{
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(12),
        lineHeight: 20,
    },

    smallTitle:{
      fontFamily: 'futura',
      fontSize: getFontSize(12),
      marginTop:5,
      lineHeight: 20,
      color:'#000000'
    },

    descriptionView: {
        marginHorizontal: 10,
        padding: 10,
    },

    spaceText: {
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(10),
        lineHeight: 20,
    },

    readmore: {
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(11),
        marginTop: -3,
    }
});

export default styles;
