import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#eee'
    },
    backButton: {
        marginLeft: 10,
        marginBottom: 40
    },
    btn_backImage:{
        height: 30,
        width: 30,
        marginTop: 44,
        marginLeft: 16,
        marginBottom: 32
    },
    steps: {
        fontSize: 10,
        fontFamily: 'FuturaStd-Medium',
        color: '#a2c5bf'
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        marginBottom: 90
    },
    heading: {
        color: 'black',
        fontFamily: 'FuturaStd-Medium',
        marginTop: 5,
        fontSize: 20,
        marginBottom: 30
    },
    hotelInfoContainer: {
        flexDirection: 'row'
    },
    hotelThumbView: {
        flex: 0.38
    },
    hotelInfoView: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        flex: 0.7,
        paddingTop: 7,
        paddingHorizontal: 12
    },
    hotelThumb: {
        resizeMode: 'cover',
        width: '100%',
        height: 90
    },
    
    hotelName: {
        color: 'black',
        fontFamily: 'FuturaStd-Medium',
        fontSize: 18,
    },
    hotelAddress: {
        fontFamily: 'FuturaStd-Light',
        fontSize: 14,
        color: '#54585b',
    },
    
    bold400: {
        fontWeight: '400'
    },
    form: {
        flex: 1,
        marginTop: 20
    },
    labelGuest: {
        fontFamily: 'FuturaStd-Light',
        fontSize: 16,
        fontWeight: 'bold'
    },
    inputFieldsView: {
        flexDirection: 'column',
        marginTop: 10,

    },
    firstNameFlex: {
        flex: 1,
        marginBottom: 5
    },
    lastNameFlex: {
        flex: 1,
        marginBottom: 5
    },
    gender: {
        height: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'auto',
        shadowColor: '#858585',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 2,
        shadowOpacity: 0.5
    },
    formField: {
        height: 50,
        backgroundColor: '#fff',
        textAlign: 'center',
        shadowColor: '#858585',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 2,
        shadowOpacity: 0.5,
        fontSize: 16,
        fontFamily: 'FuturaStd-Light'
    },
    spaceRight: {
        marginRight: 10
    },
    guestInfoWrapper: {
        marginTop: 15,
        marginBottom: 30,
        flex: 1
    },
    titleContainer: {
        marginLeft: 8,
        marginBottom: 5,
        justifyContent: 'flex-end',  
        alignItems: 'center',
        width: 80,
    },
    listItem: {
        width: "100%",
        alignContent: 'center',
        marginLeft: 0,
        marginRight: 20,
        borderBottomColor: '#e3e3e3',
        borderBottomWidth: 1,
        flexDirection: 'row',
        paddingVertical: 5
    },
    listItemNameWrapper: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    listItemValueWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        alignContent:'center',
        justifyContent:'flex-end',
        flexWrap: 'wrap',
    },
    listItemText: {
        fontFamily: 'FuturaStd-Light',
        fontSize: 16,
        color: '#777'
    },
    valueText: {
        fontSize: 16,
        fontFamily: 'FuturaStd-Light',
        color: '#d97b61'
    }, 
});

export default styles;
export const titleSelectorStyles = StyleSheet.create({
    inputIOS: {
      height: 50,
      fontSize: 16,
      color: 'black',
      alignSelf: 'flex-end',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      width: "100%",
  //     backgroundColor: 'red'
    },
    inputAndroid: {
      height: 50,
      width: 70,
      //fontSize: 16,
      // color: 'black',
      alignSelf: 'flex-end',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      width: "100%",
  //     backgroundColor: 'red'
    },
  });