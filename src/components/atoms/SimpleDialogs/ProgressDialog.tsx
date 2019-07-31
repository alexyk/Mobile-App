import React, { Component } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import Dialog from "./Dialog";
type ProgressDialogProps = {
  message: string,
  messageStyle?: any,
  activityIndicatorColor?: any,
  activityIndicatorSize?: any,
  activityIndicatorStyle?: any
};
class ProgressDialog extends Component<ProgressDialogProps, {}> {
  render() {
    const {
      message,
      messageStyle,
      activityIndicatorColor,
      activityIndicatorSize,
      activityIndicatorStyle
    } = this.props;
    return (
      <Dialog {...this.props}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ActivityIndicator
            animating={true}
            color={activityIndicatorColor}
            size={activityIndicatorSize}
            style={activityIndicatorStyle}
          />
          <Text
            style={[
              {
                marginLeft: 15,
                marginRight: 10,
                fontSize: 16,
                color: "#00000089",
                fontFamily: "FuturaStd-Light"
              },
              messageStyle
            ]}
          >
            {message}
          </Text>
        </View>
      </Dialog>
    );
  }
}
// delete ProgressDialog.propTypes.children;
export default ProgressDialog;
