import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f0f1f3",
    paddingTop: 40
  },
  titleConatiner: {
    width: "100%"
  },
  text: {
    color: "#000"
  },
  navItem: {
    borderBottomWidth: 0.5,
    borderColor: "#e2e4e3",
    padding: 10,
    paddingBottom: 20,
    paddingTop: 20,
    marginLeft: 10,
    marginRight: 10,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row"
  },
  navIcon: {
    width: 20,
    height: 23
  },
  navItemText: {
    fontFamily: "FuturaStd-Light",
    fontSize: 17
  },
  navCurrency: {
    color: "#da7b60",
    fontFamily: "FuturaStd-Light",
    fontSize: 18
  }
});

export default styles;
