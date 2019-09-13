import React, { Component } from "react";
import { Text } from "react-native";
import PropTypes from 'prop-types'

import MaterialDialog from "../../atoms/MaterialDialog/MaterialDialog";
import { clog, wlog } from "../../../utils/debug/debug-tools";
import { getObjectClassName } from "js-tools";


class MessageDialog extends Component {
  static self = null;
  static parent = null;

  /**
   * Use by adding <MessageDialog parent={this} title={this.state.messageTitle} message={this.state.dialogMessage} isVisible={this.state.isVisible} />
   * State is taken care of by using parent.setState(...)
   * @param {String} text The message text
   * @param {Number} code A code associated with this message and used to decide what to do in onOk or onCancel handlers
   */
  static showMessage(title, text, code) {
    const { parent } = MessageDialog;
    const { messageVisible, messageTitle, dialogMessage, messageCode } = parent.state;

    if (messageVisible && (dialogMessage != text || code != messageCode || title != messageTitle)) {
      throw new Error(`[MessageDialog] Showing message "${text} with code "${code} while message is visible as "${dialogMessage}" with code "${messageCode}"`);
    } else if (messageVisible) {
      wlog(`[MessageDialog] Message Dialog already visible`);
    }

    parent.setState({messageVisible: true, messageTitle: title, dialogMessage: text, messageCode: code});
  }

  static hide(code) {
    const { parent } = MessageDialog;
    const { messageVisible, dialogMessage, messageCode } = parent.state;

    
    if (messageVisible && code != messageCode) {
      throw new Error(`[MessageDialog] Trying to hide message "${dialogMessage} with code "${code} while message is visible as code "${messageCode}"`);
    } else if (!messageVisible) {
      throw new Error(`[MessageDialog] Trying to hide message "${dialogMessage} with code "${code} while message is not visible and code is "${messageCode}"`);
    }

    parent.setState({messageVisible: false, messageCode: code});
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

    if (__DEV__) {
      const printD = this.propsToDebug.bind(this);
      const parentName = getObjectClassName(parent);
      clog(`[MessageDialog][${parentName}] current: ${printD(this.props)} next: ${printD(nextProps)}`);
    }

    return (
      nextMessage != null 
      && nextIsVisible != null
      && (message != nextMessage || isVisible != nextIsVisible )
    )
  }

  propsToDebug(props) {
    const { isVisible, message, title } = props;
    
    function toDebug(value, marker) {
      return `${value!=null
          ? value
            ? marker.toUpperCase()
            : marker.toLowerCase()
          : `${marker.toLowerCase()}-`
      }`;
    }

    return toDebug(isVisible,"v") +
      toDebug(message,'m') +
      toDebug(title,'t')
  }
  

  onOkInternal() {
    const { parent, onOk } = this.props;
    let messageCode;

    if (parent != null) {
      messageCode = parent.state.messageCode;
      parent.setState({messageVisible: false});
    }
    
    if (onOk) {
      onOk(messageCode);
    }
  }

  onCancelInternal() {
    const { parent, onCancel } = this.props;
    let messageCode;
    
    if (parent != null) {
      messageCode = parent.state.messageCode;
      parent.setState({messageVisible: false});
    }


    if (onCancel) {
      onCancel(messageCode);
    }
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
      extraProps,
      modalProps,
      modalContainerStyle
    } = this.props;

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
        style={{paddingBottom: 10, fontSize: 12}}
        onOk={this.onOkInternal}
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

MessageDialog.defaultProps = {
  title: 'Message',
  modalContainerStyle: {
    borderRadius: 7,
  },
  buttonsContainerStyle: {
    justifyContent: 'space-around'
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
  }
}


export default MessageDialog;
