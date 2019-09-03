import { StyleSheet } from "react-native";


export const defaultStyle = StyleSheet.create({
  container: {
    backgroundColor: "#D76E5B",
    padding: 1,
    justifyContent: 'center'
  }
});

export const defaultPickerStyle = StyleSheet.create({
  inputIOS: {
    fontFamily: "FuturaStd-Light",
    fontSize: 12,
    height: 30,
    width: 60,
    marginRight: 10,
    borderRadius: 30,
    borderColor: "#D76E5B",
    borderWidth: 1,
    color: "#54575a",
    textAlign: "center",
    backgroundColor: "#FAFAFA"
  },
  inputAndroid: {
    fontFamily: "FuturaStd-Light",
    fontSize: 18,
    height: 30,
    width: 60,
    color: "#54575a",
    backgroundColor: "#FAFAFA"
  }
});