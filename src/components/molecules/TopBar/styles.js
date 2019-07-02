import { StyleSheet } from 'react-native';
import { commonText } from '../../../common.styles';


export default StyleSheet.create({
  container: {
    flex: 0.11,
    // width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8',
  },

  backButtonImage: {

  },

  containerBack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8',
  },

  backButton: {
    margin: 5,
    // marginLeft: 10,
    // marginBottom: 40    
  },

  text: {
    ...commonText,
    color: 'black',
    marginTop: 35,
    marginLeft: 5,
    fontSize: 16
    // backgroundColor: 'red',
},

});
