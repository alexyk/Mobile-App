import { StyleSheet } from "react-native";

export default StyleSheet.create({
  childOptionsContainer: {
    flexDirection: "column",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "stretch",
    width: "80%"
  },
  childOptionsContainer2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  childOptions: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  separator: {
    marginVertical: 10,
    backgroundColor: "#00000008"
  },
  textChildTitle: {
    fontFamily: "FuturaStd-Light",
    fontSize: 14,
    fontWeight: "100",
    marginRight: 10,
    color: "#54575a"
  },
  textTitle: {
    fontFamily: "FuturaStd-Light",
    fontSize: 18,
    fontWeight: "400",
    textDecorationLine: "underline",
    marginRight: 10,
    color: "#54575a"
  }
});