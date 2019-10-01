import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f1f3"
  },

  navContainer: {
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",

    // ios
    backgroundColor: "#f0f1f3",
    alignItems: "center",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 0.8,

    // android (Android +5.0)
    elevation: 0.5
  },

  titleConatiner: {
    flexDirection: "row"
  },

  body: {
    flexDirection: "column"
  },

  lineStyle: {
    borderWidth: 0.3,
    borderColor: "#cccccc",
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20
  },

  topContainer: {
    width: "100%",
    height: 140,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  }
});

export default styles;
