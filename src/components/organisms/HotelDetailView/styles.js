import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "column"
  },

  topView: {
    backgroundColor: "#ffffff",
    marginTop: -20,
    marginLeft: 15,
    marginRight: 15,
    paddingBottom: 10
  },

  topTitleText: {
    fontFamily: "futura",
    fontSize: 19,
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    color: "#000000"
  },

  rateViewContainer: {
    flexDirection: "row"
  },

  rateText: {
    fontFamily: "FuturaStd-Light",
    fontSize: 12,
    paddingLeft: 10,
    paddingRight: 10,
    color: "#898c8d"
  },

  addressText: {
    fontFamily: "FuturaStd-Light",
    fontSize: 13,
    paddingTop: 3,
    paddingBottom: 2,
    paddingLeft: 10,
    paddingRight: 10,
    color: "#000"
  },

  lineStyle: {
    borderWidth: 0.3,
    borderColor: "#cccccc",
    margin: 7
  },

  detailsStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5
  },

  normalText: {
    fontFamily: "FuturaStd-Light",
    fontSize: 14,
    lineHeight: 20
  },

  smallTitle: {
    fontFamily: "futura",
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
    color: "#000000"
  },

  descriptionScrollViewContainer: {
    marginHorizontal: 10,
    marginVertical: 10
    // height: 210
  },

  descriptionScrollView: {},

  spaceText: {
    fontFamily: "FuturaStd-Light",
    fontSize: 13,
    lineHeight: 20
  },

  readmore: {
    fontFamily: "FuturaStd-Light",
    fontSize: 13,
    marginTop: -2
  }
});

export const htmlViewStyleSheet = StyleSheet.create({
  body: {
    fontFamily: "FuturaStd-Light",
    textAlign: "justify"
  },
  b: {
    fontWeight: "bold",
    fontFamily: "FuturaStd-Light"
  }
});

export default styles;
