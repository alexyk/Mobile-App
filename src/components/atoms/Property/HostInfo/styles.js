import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../../utils/designUtils';

const styles = StyleSheet.create({
  Item:{
      marginTop:30,
      flexDirection:'row'
  },

  optionalText:{
      color:'black',
      fontSize:getFontSize(9),
      fontFamily: 'FuturaStd-Light',
  },

  titleText:{
      color:'black',
      fontSize: getFontSize(17),
      fontFamily: 'FuturaStd-Light',
      marginTop:14
  },

  nameItem:{
      marginLeft:10
  },

  img:{
      width:60,
      height:60,
      borderRadius:30
  }
});


export default styles;
