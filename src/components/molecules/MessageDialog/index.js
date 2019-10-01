import React, { Component } from "react";
import { Text } from "react-native";
import { BackHandler } from "react-native";
import lodash, { cloneDeep } from 'lodash'

import MaterialDialog from "../../atoms/MaterialDialog/MaterialDialog";
import { clog, wlog } from "../../../utils/debug/debug-tools";
import { getObjectClassName, isString } from "js-tools";
import { messageDialogDebug } from "../../../config-debug";


class MessageDialog extends Component {
  static self = null;
  static parent = null;
  static extraProps = {};

  /**
   * Use by adding to render method:
   *        <MessageDialog
   *          parent={this}
   *          title={this.state.messageTitle}
   *          message={this.state.dialogMessage}
   *          isVisible={this.state.messageVisible}
   *         />
   * Optional often used props:
   *  onHide - handler that triggers (if set) on both onOk and onCancel
   * 
   * State is taken care of by using parent.setState(...)
   * @param {String} text The message text
   * @param {Number|String} code A code or/and style-preset, associated with this message and used to decide what to do in onOk or onCancel handlers
   * @param {Object|String} extraProps If in need to hide a button or set styling etc. If string - used as a name of preset, if object - presetName is name of preset if set, otherwise object props are added as custom props to MessageDialog
   */
  static showMessage(title, text, code='message', extraProps = null) {
    let presetName, customProps;

    // prepare extra styling
    if (isString(extraProps)) {
      // use a predefined style preset
      presetName = extraProps;
    } else if (extraProps) {
      // combine a predefined style preset (extraProps.presetName) with custom styling (extraProps)
      (presetName = extraProps.presetName) && (delete extraProps.presetName); // experimenting with syntax
      customProps = extraProps;
    } else if (isString(code)) {
      presetName = code;
    } else {
      MessageDialog.extraProps = {};
    }

    // apply extra styling
    if (presetName && customProps) {
      MessageDialog.extraProps = {
        ...MessageDialog.extraPropsPresets[presetName],
        ...extraProps
      };
    } else {
      MessageDialog.extraProps = MessageDialog.extraPropsPresets[presetName];
    }

    const { parent } = MessageDialog;
    const { messageVisible, messageTitle, dialogMessage, messageCode } = parent.state;

    if (messageVisible && (dialogMessage != text || code != messageCode || title != messageTitle)) {
      throw new Error(
        `[MessageDialog] Showing message "${text} with code "${code} while message is visible as "${dialogMessage}" with code "${messageCode}"`
      );
    } else if (messageVisible) {
      wlog(`[MessageDialog] Message Dialog already visible`);
    }

    parent.setState({ messageVisible: true, messageTitle: title, dialogMessage: text, messageCode: code });
  }

  static hide(code) {
    const { parent } = MessageDialog;
    const { messageVisible, dialogMessage, messageCode } = parent.state;

    if (messageVisible && code != messageCode) {
      throw new Error(
        `[MessageDialog] Trying to hide message "${dialogMessage} with code "${code} while message is visible as code "${messageCode}"`
      );
    } else if (!messageVisible) {
      throw new Error(
        `[MessageDialog] Trying to hide message "${dialogMessage} with code "${code} while message is not visible and code is "${messageCode}"`
      );
    }

    parent.setState({ messageVisible: false, messageCode: code });
  }

  constructor(props) {
    super(props);

    const { parent } = props;

    MessageDialog.self = this;
    MessageDialog.parent = parent;

    this.onOkInternal = this.onOkInternal.bind(this);
    this.onCancelInternal = this.onCancelInternal.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { message: nextMessage, isVisible: nextIsVisible } = nextProps;
    const { message, isVisible, parent } = this.props;

    if (__DEV__ && messageDialogDebug) {
      const printD = this.propsToDebug.bind(this);
      const parentName = getObjectClassName(parent);
      clog(`[MessageDialog][${parentName}] current: ${printD(this.props)} next: ${printD(nextProps)}`);
    }

    return nextMessage != null && nextIsVisible != null && (message != nextMessage || isVisible != nextIsVisible);
  }

  propsToDebug(props) {
    const { isVisible, message, title } = props;

    function toDebug(value, marker) {
      return `${value != null ? (value ? marker.toUpperCase() : marker.toLowerCase()) : `${marker.toLowerCase()}-`}`;
    }

    return toDebug(isVisible, "v") + toDebug(message, "m") + toDebug(title, "t");
  }

  onOkInternal() {
    const { parent, onOk, onHide } = this.props;
    let messageCode;

    if (parent != null) {
      messageCode = parent.state.messageCode;
      parent.setState({ messageVisible: false });
    }

    if (onOk) {
      onOk(messageCode);
    }
    if (onHide) {
      onHide(messageCode);
    }
  }

  onCancelInternal() {
    const { parent, onCancel, onHide } = this.props;
    let messageCode;

    if (parent != null) {
      messageCode = parent.state.messageCode;
      parent.setState({ messageVisible: false });
    }

    if (onCancel) {
      onCancel(messageCode);
    }
    if (onHide) {
      onHide(messageCode);
    }
  }

  render() {
    // merge props
    let mergedProps = cloneDeep(this.props);
    lodash.merge(mergedProps, MessageDialog.extraProps || {});

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
      modalProps,
      modalContainerStyle,
      extraDialogProps
    } = mergedProps;


    if (!isVisible) {
      return null;
    }

    return (
      <MaterialDialog
        title={title}
        visible={isVisible}
        isVisibleBottomBar={true}
        cancelLabel={cancelLabel != null ? cancelLabel : "No"}
        onCancel={this.onCancelInternal}
        okLabel={okLabel || "Yes"}
        style={{ paddingBottom: 10, fontSize: 12 }}
        onOk={this.onOkInternal}
        okStyle={[commonButtonStyle, okStyle]}
        cancelStyle={[commonButtonStyle, cancelStyle]}
        cancelContainerStyle={[commonButtonContainerStyle, cancelContainerStyle]}
        buttonsContainerStyle={buttonsContainerStyle}
        okContainerStyle={[commonButtonContainerStyle, okContainerStyle]}
        modalProps={modalProps}
        bottomSpace={10}
        modalContainerStyle={modalContainerStyle}
        {...extraDialogProps}
      >
        <Text style={[{ fontSize: 15 }, messageStyle]}>{message}</Text>
      </MaterialDialog>
    );
  }

  static materialDesign = {
    commonButtonContainerStyle: {},
    commonButtonStyle: { fontSize: 17, color: "black" },
    modalContainerStyle: { borderRadius: 15 },
    buttonsContainerStyle: {},
    hasBottomSpace: false,
    hasSeparator: true
  };
  static materialDesignNonOval = {
    ...MessageDialog.materialDesign,
    borderRadius: 0
  };
  static orangeDesign = {
    modalContainerStyle: {
      borderRadius: 7
    },
    buttonsContainerStyle: {
      justifyContent: "space-around"
    },
    commonButtonStyle: {
      borderRadius: 3,
      color: "white",
      margin: 3,
      fontWeight: "100",
      fontSize: 14
    },
    commonButtonContainerStyle: {
      backgroundColor: "#C47B62",
      borderRadius: 5,
      padding: 5
    },
    extraDialogProps: {
      hasBottomSpace: true
    }
  };
  static extraPropsPresets = {
    exit: {
      ...MessageDialog.materialDesign,
      onOk: () => BackHandler.exitApp()
    },
    message: {
      ...MessageDialog.orangeDesign,
      okLabel: "OK",
      cancelLabel: ""
    },
    "login-expired": {
      ...MessageDialog.materialDesign,
      okLabel: "OK",
      cancelLabel: ""
    },
    "email-verification": {
      ...MessageDialog.orangeDesign,
      okLabel: "Send Email",
      okStyle: { width: "80%", textAlign: "center" },
      cancelLabel: "",
    }
  };
}

MessageDialog.defaultProps = {}

export default MessageDialog;