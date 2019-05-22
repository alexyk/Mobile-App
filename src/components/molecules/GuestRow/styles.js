import { StyleSheet } from 'react-native';
import { getFontSize } from '../../../utils/designUtils';

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection:'row',
      width:'100%',
      height: 80,
    },

    titleStyle:{
      fontFamily: 'FuturaStd-Light',
      fontSize: getFontSize(17),
      color: '#54575a',
    },

    subtitleStyle:{
      fontFamily: 'FuturaStd-Light',
      fontSize: getFontSize(12),
      color: '#54575a',
    },

    headStyle: {
      marginLeft: 15,
    },

    countStyle: {
      marginRight: 15,
    },
});

export default styles;
