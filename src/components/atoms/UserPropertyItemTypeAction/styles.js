import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

const styles = StyleSheet.create({
    container:{
        paddingTop:20,
        paddingBottom:20,
        paddingLeft:20,
        paddingRight:20,
        flexDirection:'row',
        justifyContent:'space-between',
    },

    title:{
        fontFamily: 'FuturaStd-Light',
        fontSize: getFontSize(15),
        color:'#000',
    },

    avatar: {
        height: 25,
        width: 25,
    },
});

export default styles;
