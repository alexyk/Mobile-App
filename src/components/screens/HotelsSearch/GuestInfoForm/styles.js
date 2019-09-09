import { StyleSheet, Platform } from "react-native";
import { commonText } from "../../../../common.styles";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#eee"
  },
  backButton: {
    marginLeft: 10,
    marginBottom: 40
  },
  btn_backImage: {
    height: 30,
    width: 30,
    marginTop: 44,
    marginLeft: 16,
    marginBottom: 32
  },
  steps: {
    fontSize: 10,
    fontFamily: "FuturaStd-Medium",
    color: "#a2c5bf"
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 90
  },
  heading: {
    color: "black",
    fontFamily: "FuturaStd-Medium",
    marginTop: 5,
    fontSize: 20,
    marginBottom: 30
  },
  hotelInfoContainer: {
    flexDirection: "row"
  },
  hotelThumbView: {
    flex: 0.38
  },
  hotelInfoView: {
    flexDirection: "column",
    justifyContent: "flex-end",
    flex: 0.7,
    paddingTop: 7,
    paddingHorizontal: 12
  },
  hotelThumb: {
    resizeMode: "cover",
    width: "100%",
    height: 90
  },

  hotelName: {
    color: "black",
    fontFamily: "FuturaStd-Medium",
    fontSize: 18
  },
  hotelAddress: {
    fontFamily: "FuturaStd-Light",
    fontSize: 14,
    color: "#54585b"
  },

  bold400: {
    fontWeight: "400"
  },
  form: {
    flex: 1,
    marginTop: 20
  },
  labelGuest: {
    fontFamily: "FuturaStd-Light",
    fontSize: 16,
    fontWeight: "bold",
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFF',
  },
  inputFieldsView: {
    flexDirection: "column",
    // marginTop: 10
  },
  firstNameFlex: {
    marginBottom: 5
  },
  lastNameFlex: {
    marginBottom: 5
  },
  gender: {
    height: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "auto",
    shadowColor: "#858585",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 2,
    shadowOpacity: 0.5
  },
  formField: {
    height: 50,
    backgroundColor: "#fff",
    textAlign: "center",
    shadowColor: "#858585",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 2,
    shadowOpacity: 0.5,
    fontSize: 16,
    fontFamily: "FuturaStd-Light"
  },
  spaceRight: {
    marginRight: 10
  },
  guestInfoWrapper: {
    marginVertical: 5,
  },
  titleContainer: {
    width: 80,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: 'orange'
  },
  listItem: {
    width: "100%",
    alignContent: "center",
    marginLeft: 0,
    marginRight: 20,
    borderBottomColor: "#e3e3e3",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 5
  },
  guestsCount: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    marginLeft: 0,
    marginRight: 20,
    borderBottomColor: "#e3e3e3",
    borderBottomWidth: 1
  },
  listItemNameWrapper: {
    width: "35%",
    flexDirection: "column",
    justifyContent: "center"
  },
  listItemValueWrapper: {
    width: "65%",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap"
  },
  listItemText: {
    fontFamily: "FuturaStd-Light",
    fontSize: 16,
    color: "#777"
  },
  valueText: {
    fontSize: 16,
    fontFamily: "FuturaStd-Light",
    textAlign: 'right',
    color: "#d97b61",
  },
  childCount: {
    fontSize: 12,
  },
  childAgeText: {
    ...commonText,
    fontSize:13,
    fontWeight: "200",
    width: 80,
    height: 30,
    color:'#AAA',
    alignSelf: 'center',
    textAlignVertical: 'center',
    textAlign: 'center',
    paddingTop: (Platform.OS == "ios" ? 5 : 0)
  }
});

export default styles;
export const titleSelectorStyles = StyleSheet.create({
  inputIOS: {
    height: 50,
    width: "100%",
    fontSize: 16,
    color: "black",
    alignSelf: "flex-end",
    justifyContent: "flex-end",
    alignItems: "flex-start"
  },
  inputAndroid: {
    fontSize: 12,
    color:'grey',
    height: 30,
    width: 100,
    alignSelf: 'flex-start',
    textAlign: "left",
    backgroundColor: "#eee"
  }
});
