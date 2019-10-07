import React, { Component } from "react";
import { Text } from "react-native";
import { BackHandler } from "react-native";
import lodash, { cloneDeep } from 'lodash'

import MaterialDialog from "../../atoms/MaterialDialog/MaterialDialog";
import { clog, wlog } from "../../../utils/debug/debug-tools";
import { isString } from "js-tools";
import DBG from "../../../config-debug";
import store from "../../../redux/store"
import { setMessageDialogState } from "../../../redux/action/userInterface";
import navigationService from "../../../services/navigationService";


class MessageDialog extends Component {
  static extraProps = {};

  /**
   * Use by adding to render method:
   *   <MessageDialog
   *       {...this.props.messageDialog}
   *   />
   * where this.props.messageDialog come from redux state for messageDialog in state.userInterface.messageDialog
   * (for an example see HotelDetails, Explore, Profile etc.)
   * 
   * Optional often used props:
   *  onHide - handler that triggers (if set) on both onOk and onCancel
   * 
   * State is taken care of by using redux (See static getter and setter -> MessageDialog.state)
   * @param {String} text The message text
   * @param {Number|String} code A code or/and style-preset, associated with this message and used to decide what to do in onOk or onCancel handlers
   * @param {Object|String} extraProps If in need to hide a button or set styling etc. If string - used as a name of preset, if object - presetName is name of preset if set, otherwise object props are added as custom props to MessageDialog
   */
  static showMessage(title, text, code='message', extraProps = null) {
    MessageDialog.__showDialog(title, text, code, extraProps);
  }

  static show(title, content, code='message', extraProps = null) {
    MessageDialog.__showDialog(title, content, code, extraProps);
  }

  static __showDialog(title, contentOrText, code, extraProps = null) {
    let presetName, customProps;
    let text, contentState;

    if (isString(contentOrText)) {
      text = contentOrText;
      contentState = {
        message: text,
        content: null
      }
    } else {
      contentState = {
        message: null,
        content: contentOrText
      }
    }

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

    const stateUpdate = function (previousState)  {
      const { isVisible, title, message, code: prevCode, content } = previousState;

      if (text && !content && message) {
        if (isVisible && (message != text || code != prevCode || title != title)) {
          throw new Error(
            `[MessageDialog] Showing message "${text} with code "${code} while message is visible as "${message}" with code "${prevCode}"`
          );
        } else if (isVisible) {
          wlog(`[MessageDialog] Message Dialog already visible`);
        }
      }

      const newState = { isVisible: true, title: title, code, ...contentState };
      MessageDialog.state = newState;
    }

    MessageDialog.extraProps.title = title;
    MessageDialog.extraProps.content = contentState.content;
    MessageDialog.extraProps.message = text;
    stateUpdate(MessageDialog.state);
  }


  static hide(code) {
    const { isVisible, message, code: prevCode } = MessageDialog.state;
    MessageDialog.state = { isVisible: false, code };

    if (isVisible && code != prevCode) {
      throw new Error(
        `[MessageDialog] Trying to hide message "${message} with code "${code} while message is visible as code "${prevCode}"`
      );
    } else if (!isVisible) {
      throw new Error(
        `[MessageDialog] Trying to hide message "${message} with code "${code} while message is not visible and code is "${prevCode}"`
      );
    }
  }

  /**
   * Write state to Redux cache
   */
  static set state(newState) {
    store.dispatch(setMessageDialogState(newState));
  }


  /**
   * Get state from Redux cache
   */
  static get state() {
    return store.getState().userInterface.messageDialog;
  }

  constructor(props) {
    super(props);

    this.onOkInternal = this.onOkInternal.bind(this);
    this.onCancelInternal = this.onCancelInternal.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    let result = true;

    if (__DEV__ && DBG.messageDialogDebug) {
      const printD = this.propsToDebug.bind(this);
      const parentName = navigationService.getCurrentScreenName();
      clog(`[MessageDialog][${parentName}] current: ${printD(this.props)} next: ${printD(nextProps)}`);
    }

    return result;
  }

  propsToDebug(props) {
    const { isVisible, message, title, content } = props;

    function toDebug(value, marker) {
      return `${value != null ? (value ? marker.toUpperCase() : marker.toLowerCase()) : `${marker.toLowerCase()}-`}`;
    }

    return toDebug(isVisible, "v") + toDebug(message, "m") + toDebug(content, "c") + toDebug(title, "t");
  }

  onOkInternal(mergedProps) {
    return function () {
      const { onOk, onHide } = mergedProps;

      let { code } = MessageDialog.state;
      MessageDialog.state = { isVisible: false };

      if (onOk) {
        onOk(code, mergedProps);
      }
      if (onHide) {
        onHide(code, mergedProps);
      }
    }
  }

  onCancelInternal(mergedProps) {
    return function () {
      const { onCancel, onHide } = mergedProps;
      let { code } = MessageDialog.state;
      MessageDialog.state = { isVisible: false };

      if (onCancel) {
        onCancel(code, mergedProps);
      }
      if (onHide) {
        onHide(code, mergedProps);
      }
    }
  }

  onCustomInternal(mergedProps) {
    return function() {
      const { onCustom } = mergedProps;
      if (onCustom) {
        onCustom(mergedProps);
      }
    }
  }

  _renderContent(mergedProps) {
    const { content, message, messageStyle } = mergedProps;

    if (message) {
      return <Text style={[{ fontSize: 15 }, messageStyle]}>{message}</Text>;
    } else {
      return content;
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
      isVisible,
      okLabel,
      okStyle,
      okContainerStyle,
      cancelLabel,
      cancelStyle,
      cancelContainerStyle,
      modalProps,
      modalContainerStyle,
      extraDialogProps,
      customLabel,
    
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
        onCancel={this.onCancelInternal(mergedProps)}
        okLabel={okLabel || "Yes"}
        style={{ paddingBottom: 10, fontSize: 12 }}
        onOk={this.onOkInternal(mergedProps)}
        okStyle={[commonButtonStyle, okStyle]}
        cancelStyle={[commonButtonStyle, cancelStyle]}
        cancelContainerStyle={[commonButtonContainerStyle, cancelContainerStyle]}
        buttonsContainerStyle={buttonsContainerStyle}
        okContainerStyle={[commonButtonContainerStyle, okContainerStyle]}
        modalProps={modalProps}
        bottomSpace={10}
        modalContainerStyle={modalContainerStyle}
        onCustom={this.onCustomInternal(mergedProps)}
        customLabel={customLabel}
        {...extraDialogProps}
      >
        { this._renderContent(mergedProps) }
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
      onOk: () => {
        BackHandler.exitApp()
      }
    },
    message: {
      ...MessageDialog.orangeDesign,
      okLabel: "OK",
      cancelLabel: ""
    },
    settings: {
      ...MessageDialog.orangeDesign,
      okLabel: "Close",
      cancelLabel: "",
      customLabel: "Clear Console",
      onCustom: (mergedProps) => { console.clear(); }
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

MessageDialog.defaultProps = {};

export default MessageDialog;
