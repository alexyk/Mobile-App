import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

const styles = StyleSheet.create({
    container:{
        paddingTop:20,
        paddingBottom:20,
        paddingLeft:20,
        paddingRight:20,
        justifyContent:'space-between',
        flexDirection:'row',
    },

    title:{
        color:'black',
        fontSize: getFontSize(15),
        fontFamily: 'FuturaStd-Light',
    },

    info:{
        color:'#DA7B61',
        fontSize: getFontSize(15),
        fontFamily: 'FuturaStd-Light',
    }
});

export default styles;
