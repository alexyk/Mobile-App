import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  childOptionsContainer: {
    flexDirection: 'column',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: "80%"
  },
  childOptionsContainer2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 0,
    marginBottom: 10
  },
  separator: {
    marginVertical: 10,
    backgroundColor:'#00000008'
  },
  textChildTitle: {
    fontFamily: 'FuturaStd-Light',
    fontSize: 14,
    fontWeight: '100',
    marginRight: 10,
    color: '#54575a'
  },
  textTitle: {
    fontFamily: 'FuturaStd-Light',
    fontSize: 18,
    fontWeight: '400',
    textDecorationLine: 'underline',
    marginRight: 10,
    color: '#54575a'
  },
  androidPickerWrap: {
    backgroundColor: '#D76E5B',
    padding: 1,
    marginRight: 10
  }
})

export const orderbyPickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontFamily: 'FuturaStd-Light',
    fontSize: 12,
    height: 30,
    width: 60,
    marginRight: 10,
    borderRadius: 30,
    borderColor: '#D76E5B',
    borderWidth: 1,
    color: '#54575a',
    textAlign: 'center',
    backgroundColor: '#FAFAFA'
  },
  inputAndroid: {
    fontFamily: 'FuturaStd-Light',
    fontSize: 12,
    height: 30,
    width: 60,
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    color: '#54575a',
    textAlign: 'right',
    backgroundColor: '#FAFAFA'
  }
});