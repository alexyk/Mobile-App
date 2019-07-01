import { StyleSheet, Dimensions } from 'react-native';


export default StyleSheet.create({
  main: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 5,
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent: 'center',
    width:'100%',
    backgroundColor: '#0001'
  }
});

export const htmlViewStyleSheet = StyleSheet.create({
  body: {
    fontFamily: 'FuturaStd-Light',
    fontSize: 10
  },
  b: {
    fontWeight: 'bold'
  },
  grey: {
    color: 'grey'
  }
});