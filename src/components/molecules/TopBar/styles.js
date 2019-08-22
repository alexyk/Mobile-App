import { StyleSheet } from "react-native";
import { commonText } from "../../../common.styles";

export default StyleSheet.create({
  container: {
    width: "100%",
    height: "11%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF8"
  },

  backButtonImage: {},

  containerBack: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF0"
  },

  text: {
    ...commonText,
    color: "black",
    marginTop: 35,
    marginLeft: 5,
    fontSize: 16
    // backgroundColor: 'red',
  }
});
