import React, { Component } from "react";
import { Text } from "react-native";

import MaterialDialog from "../../atoms/MaterialDialog/MaterialDialog";


class MessageDialog extends Component {
  state = {};

  constructor(props) {
    super(props);
  }

  render() {
    let {
      buttonsContainerStyle,
      commonButtonContainerStyle,
      commonButtonStyle,
      title,
      message,
      messageStyle,
      isVisible,
      okLabel,
      okStyle,
      okContainerStyle,
      cancelLabel,
      cancelStyle,
      cancelContainerStyle,
      onOk,
      onCancel,
      extraProps,
      modalProps,
      modalContainerStyle
    } = this.props;

    if (commonButtonContainerStyle == null) {
      commonButtonContainerStyle = {
        backgroundColor: "#C47B62",
        borderRadius: 5,
        padding: 5
      };
    }
    
    if (commonButtonStyle == null) {
      commonButtonStyle = {
        borderRadius: 3,
        color: "white",
        margin: 3,
        fontWeight: "100",
        fontSize: 14
      };
    }

    if (buttonsContainerStyle == null) {
      buttonsContainerStyle = {
        justifyContent: 'space-around'
      }
    }

    if (modalContainerStyle == null) {
      modalContainerStyle = {
        borderRadius: 7,
      }
    }

    return (
      <MaterialDialog
        title={title}
        visible={isVisible}
        isVisibleBottomBar={true}
        cancelLabel={cancelLabel != null ? cancelLabel : "No"}
        onCancel={onCancel}
        okLabel={okLabel || "Yes"}
        style={{paddingBottom: 10, fontSize: 12}}
        onOk={onOk}
        okStyle={[commonButtonStyle, okStyle]}
        cancelStyle={[commonButtonStyle, cancelStyle]}
        cancelContainerStyle={[commonButtonContainerStyle, cancelContainerStyle]}
        buttonsContainerStyle={buttonsContainerStyle}
        okContainerStyle={[commonButtonContainerStyle, okContainerStyle]}
        modalProps={modalProps}
        bottomSpace={10}
        modalContainerStyle={modalContainerStyle}
        {...extraProps}
      >
        <Text style={[{ fontSize: 17}, messageStyle]}>{message}</Text>
      </MaterialDialog>
    );
  }
}

export default MessageDialog;
