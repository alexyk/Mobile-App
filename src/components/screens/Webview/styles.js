import { StyleSheet } from "react-native";
import { commonText } from "../../../common.styles";
import { getSafeBottomOffset } from "../../../utils/designUtils";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    backgroundColor: "#f0f1f3",
    marginBottom: getSafeBottomOffset()
  },
  webviewContainer: {
    flex: 1
  },
  backButton: {
    margin: 5
  },
  backButtonImage: {
    // backgroundColor: 'yellow',
  },
  backButtonContainer: {
    flex: 0.11,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FFF8"
  },
  title: {
    ...commonText,
    color: "black",
    marginTop: 25,
    marginLeft: 20,
    fontSize: 20
    // backgroundColor: 'red',
  },
  backText: {
    ...commonText,
    color: "black",
    marginTop: 35,
    marginLeft: 10,
    fontSize: 14
    // backgroundColor: 'red',
  },
  webView: {}
});
export default styles;
