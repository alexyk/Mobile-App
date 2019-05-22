import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../../utils/designUtils';

const styles = StyleSheet.create({
    container:{
        marginTop:30,
        marginLeft:20,
        marginRight:20,
        justifyContent:'space-between',
        flexDirection:'row'
    },

    textFirst:{
        color:'black',
        fontSize: getFontSize(15),
        fontFamily: 'FuturaStd-Light',
    },

    textLast:{
        color:'#DA7B61',
        fontSize: getFontSize(15),
        fontFamily: 'FuturaStd-Light',
    }
});

export default styles;
