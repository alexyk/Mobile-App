import {StyleSheet, Dimensions, Platform} from 'react-native';
import { getFontSize } from '../../../../utils/designUtils';
const { width } = Dimensions.get('screen');
const dimensionWindows = Dimensions.get('window');

export default styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#eee'
  },
  backButton:{
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 25,
    marginLeft: 15,
  },
  btn_backImage:{
    height: 24,
    width: 24,
    resizeMode: 'contain'
    },
    titleText: {
    color: '#000',
    fontSize: getFontSize(22),
    fontFamily: 'FuturaStd-Light',
    marginLeft: 20,
  },
  closeView: {
    height: 80,
    justifyContent: 'flex-end',
    paddingLeft: 18
  },
  closeSvg: {
    height: 25,
    width:25
  },
  bottomBar: {
    backgroundColor: '#fff',
    height: 80,
    alignItems: 'center',
    padding: 15
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#cc8068',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: getFontSize(18),
    fontFamily: 'FuturaStd-Light'
  },
  header: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row',
    // borderBottomColor: '#d4d4d4',
    // borderBottomWidth: 1,
    paddingBottom: 15
  },
  headerIcons: {
    height: 45,
    width: 45
  },
  residence: {
    height: 80,
    width: 80,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  residenceType: {
    textAlign: 'center',
    marginTop: 10,
    color: '#656565',
    fontFamily: 'FuturaStd-Light'
  },
  filterComponentHorizontalContainer: {
    width: '100%',
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: 'red'
  },
  separator: {
    width: "100%",
    height: 1,
    borderTopWidth: 1,
    borderTopColor: "#b1b1b1",
  },
  residenceView: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    borderBottomColor: '#d4d4d4',
    borderBottomWidth: 1,
    paddingBottom: 15
  },
  tick: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 0,
    top: 0
  },
  selected: {
    borderColor: '#cc8068'
  },
  starRatingView: {
    padding: 15
  },
  starRatingText: {
    fontSize: getFontSize(18),
    fontFamily: 'FuturaStd-Medium',
  },
  starView: {
    flexDirection: 'row',
    paddingTop: 15,
    justifyContent: 'space-between'
  },
  starBox: {
    backgroundColor: '#fff',
    height: 70,
    width: (Dimensions.get('window').width - 50)/5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratingNumber: {
    textAlign: 'center',
    fontSize: getFontSize(18),
    color: '#999999'
  },
  star: {
    height: 20,
    width: 20,
    marginTop: 5
  },
  activeRating: {
    backgroundColor: '#cc8068'
  },
  activeRatingText: {
    color: '#fff'
  },
  nameView: {
    paddingLeft: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 0.4,
    // backgroundColor: 'red'
    // borderTopWidth: 1,
    // borderTopColor: '#c6c6c6'
  },
  nameTextInput: {
  	flex:0.6,
  	height: 40,
  	margin: 15,
  	borderColor: 'grey',
  	borderWidth: 1,
  	borderRadius: 5,
  	paddingLeft: 5
  },
  pricingView: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderTopWidth: 1,
    // borderTopColor: '#c6c6c6'
  },
  orderByTitle: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
		width: "60%",
    //backgroundColor: 'blue'
    // borderTopWidth: 1,
    // borderTopColor: '#c6c6c6'
  },
  emptyPricingView: {
    height : 0,
    width : 0
  },
  pricingText: {
    fontSize: getFontSize(18),
    fontFamily: 'FuturaStd-Medium',
    width:"50%"
  },
  set: {
    alignSelf: 'stretch',
    paddingHorizontal: 18,
    height: '60%',
  },
  group: {
    flexDirection: 'row',
    paddingVertical: 25
  },
  type: {
    flex: 1,
    justifyContent: 'center'
  },
  countView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  typeText: {
    fontFamily: 'FuturaStd-Light',
    fontSize: getFontSize(18)
  },
  minusButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cc8068'
  },
  minusText: {
    color: '#cc8068',
    fontSize: getFontSize(30),
    marginTop: -5
  },
  plusButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#cc8068'
  },
  plusText: {
    color: '#cc8068',
    fontSize: getFontSize(20),
    marginTop: -5
  },
  countText: {
    marginHorizontal: 18,
    fontFamily: 'FuturaStd-Light',
    fontSize: getFontSize(20),
    marginTop: 5
  },
  typeSubText: {
    fontSize: getFontSize(11),
    fontFamily: 'FuturaStd-Light',
    color: '#6e6e6e'
  },
  borderBottom: {
    borderBottomColor: '#e2e2e2',
    borderBottomWidth: 1
  },
  orderyByPickerWrap:{
    // paddingTop: 10,
    // paddingRight: 17,
    marginLeft: 8,
    justifyContent: 'flex-end',  
    alignItems: 'center',
		width: "40%",
  },
  inputIOS: {
    height: 50,
    fontSize: getFontSize(16),
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    backgroundColor: 'white',
    color: 'black'
  },
  searchButtonView: {
    backgroundColor: '#DA7B61',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: dimensionWindows.height*0.08,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 17,
    marginRight: 17
  },
  searchButtonText: {
    color: '#fff',
    fontFamily: 'FuturaStd-Light',
    fontSize: dimensionWindows.width * 0.05,
    padding: 14
  },
})


export const orderbyPickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 50,
    fontSize: getFontSize(16),
    color: 'black',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    width: "100%",
//     backgroundColor: 'red'
  },
  inputAndroid: {
    height: 50,
    width: 120,
    //fontSize: getFontSize(16),
    // color: 'black',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    width: "100%",
//     backgroundColor: 'red'
  }
});

export const priceMultiSliderStyle = StyleSheet.create({
  markerStyle: {
    ...Platform.select({
      ios: {
        height: 30,
        width: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowRadius: 1,
        shadowOpacity: 0.2,
      },
      android: {
        height: 30,
        width: 30,
        borderRadius: 30,
        backgroundColor: '#FFF',
        borderColor: '#555',
        borderWidth: 2,
        // elevation: 5
      },
    }),
  },
  pressedMarkerStyle: {
    ...Platform.select({
      ios: {},
      android: {
        height: 33,
        width: 33,
        borderRadius: 33,
        // elevation: 5
      },
    }),
  }
})