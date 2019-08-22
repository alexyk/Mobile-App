import { StyleSheet } from "react-native";
import {
  getSafeTopOffset,
  getSafeBottomOffset
} from "../../../../utils/designUtils";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f0f1f3",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: getSafeBottomOffset()
  },

  backButtonContainer: {
    left: 0,
    top: 0,
    position: "absolute"
  },

  backButton: {
    padding: 3,
    borderRadius: 50,
    backgroundColor: "#0008",
    scaleX: 0.8,
    scaleY: 0.8
  },

  scrollView: {},

  body: {
    zIndex: -1,
    flexDirection: "column",
    marginTop: -90
  },

  lineStyle: {
    borderWidth: 0.3,
    borderColor: "#cccccc"
  },

  roomfacility: {
    marginTop: 5
  },

  placeholderImageView: {
    marginTop: 40
  },
  placeholderImage: {
    width: 135,
    height: 135,
    marginTop: 75
  },

  etcContaner: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 20,
    marginRight: 20
  },

  etcName: {
    fontFamily: "FuturaStd-Light",
    color: "#000000",
    fontSize: 15
  },

  etcButton: {
    fontFamily: "FuturaStd-Light",
    color: "#d97b61",
    fontSize: 15
  },

  subView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    height: 100
  }
});

export default styles;
