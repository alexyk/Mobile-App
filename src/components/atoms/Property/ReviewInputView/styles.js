import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../../utils/designUtils';

const styles = StyleSheet.create({
    container:{
        height: 40,
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
        alignSelf: "center"
    },

    textLast:{
        flex: 1,
        color:'#DA7B61',
        fontSize: getFontSize(15),
        textAlign:'right',
        fontFamily: 'FuturaStd-Light',
    }
});

export default styles;
