import React from "react";
import { StyleSheet } from "react-native";
import { Text, TouchableWithoutFeedback, View } from "react-native";
import LTIcon from "../LTIcon";
import navigationService from "../../../services/navigationService";
import { NavigationActions } from "react-navigation";


export default function NavButton(props) {
  const { name, navigation, active, icon } = props;
  const text = name.replace("_", " ");

  const onPress = function() {
    navigation.navigate(name);
  };

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.tab}>
        <LTIcon
          name={icon}
          size={28}
          style={
            active === name ? styles.activeIconStyle : styles.inactiveIconStyle
          }
        />

        <Text
          style={
            active === name ? styles.activeTextStyle : styles.inactiveTextStyle
          }
        >
          {text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  tab: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10
  },
  activeIconStyle: {
    fontSize: 25,
    color: "#DA7B61"
  },
  inactiveIconStyle: {
    fontSize: 25,
    color: "#646467"
  },

  activeTextStyle: {
    fontSize: 11,
    fontFamily: "FuturaStd-Light",
    color: "#DA7B61",
    marginTop: 6
  },
  inactiveTextStyle: {
    fontSize: 11,
    fontFamily: "FuturaStd-Light",
    color: "#646464",
    marginTop: 6
  }
});
