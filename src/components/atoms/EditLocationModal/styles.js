import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)"
  },
  content: {
    width: "80%",
    height: 300,
    backgroundColor: "white",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 40,
    paddingRight: 40,
    borderRadius: 4
  },
  editContent: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  pickerSelectStyles: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    backgroundColor: "white",
    color: "black"
  },
  SaveButton: {
    padding: 14,
    backgroundColor: "#DA7B61",
    borderRadius: 4
  },
  CancelButton: {
    backgroundColor: "#DA7B61",
    padding: 14,
    borderRadius: 4
  },
  footer: {
    width: "100%",
    justifyContent: "space-around",
    flexDirection: "row"
  },
  editInput: {
    fontFamily: "FuturaStd-Light",
    fontSize: 16,
    width: "100%"
  },
  title: {
    fontFamily: "FuturaStd-Light",
    fontSize: 20
  },
  buttonTitle: {
    fontFamily: "FuturaStd-Light",
    fontSize: 18,
    color: "#fff",
    textAlign: "center"
  }
});

export default styles;
