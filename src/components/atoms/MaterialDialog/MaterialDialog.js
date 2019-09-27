import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Modal,
  Text,
  Platform,
  TouchableHighlight,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  View,
  Dimensions
} from "react-native";
import colors from "./colors";
import { material } from "react-native-typography";
import Separator from "../Separator";
import { styleFromArrayToObject } from "../../../utils/designUtils";


const { height, width } = Dimensions.get("window");

// TODO: Don't rely on Dimensions for the actions footer layout
// TODO: Support custom actions
// TODO: Stacked full-width buttons

const ActionButton = ({ testID, onPress, colorAccent, style, containerStyle, label }) => {
  return (
    <TouchableHighlight
      testID={testID}
      style={[styles.actionContainer, containerStyle]}
      underlayColor={colors.androidPressedUnderlay}
      onPress={onPress}
    >
      <Text style={[material.button, { color: colorAccent }, style]}>
        {label}
      </Text>
    </TouchableHighlight>
  )
};

const MaterialDialog = ({
  visible,
  scrolled,
  title,
  titleColor,
  titleStyle,
  colorAccent,
  cancelStyle,
  cancelContainerStyle,
  okStyle,
  okContainerStyle,
  buttonsContainerStyle,
  backgroundColor,
  addPadding,
  isVisibleBottomBar,
  hasSeparator,
  hasBottomSpace,
  onOk,
  onCancel,
  okLabel,
  cancelLabel,
  children,
  modalProps,
  bottomSpace,
  modalContainerStyle
}) => {
  cancelStyle = styleFromArrayToObject(cancelStyle);
  okStyle = styleFromArrayToObject(okStyle);
  okContainerStyle = styleFromArrayToObject(okContainerStyle);
  cancelContainerStyle = styleFromArrayToObject(cancelContainerStyle);

  return (
    <Modal
      animationType={"fade"}
      transparent
      hardwareAccelerated
      visible={visible}
      onRequestClose={onCancel != undefined ? onCancel : () => {}}
      supportedOrientations={["portrait", "landscape"]}
      {...modalProps}
    >
      <TouchableWithoutFeedback
        onPress={onCancel != undefined ? onCancel : () => {}}
      >
        <View style={styles.backgroundOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
          >
            <View
              style={[
                styles.modalContainer,
                (title != null || (addPadding && title == null)) &&
                  styles.modalContainerPadding,
                { backgroundColor },
                modalContainerStyle
              ]}
            >
              <TouchableWithoutFeedback>
                <View>
                  {title != null ? (
                    <View
                      style={
                        scrolled
                          ? styles.titleContainerScrolled
                          : styles.titleContainer
                      }
                    >
                      <Text
                        style={[
                          material.title,
                          { color: titleColor, fontSize: 20 },
                          titleStyle
                        ]}
                      >
                        {title}
                      </Text>
                    </View>
                  ) : null}
                  <View
                    style={
                      scrolled
                        ? [
                            styles.contentContainerScrolled,
                            addPadding && styles.contentContainerScrolledPadding
                          ]
                        : [
                            styles.contentContainer,
                            addPadding && styles.contentContainerPadding
                          ]
                    }
                  >
                    {children}
                  </View>

                  { hasSeparator && <Separator isHR width={"80%"} /> }

                  {isVisibleBottomBar ? ( //onOk != null && onCancel != null
                    <View
                      style={
                        scrolled
                          ? [styles.actionsContainerScrolled, buttonsContainerStyle]
                          : [styles.actionsContainer, buttonsContainerStyle]
                      }
                    >
                      {onCancel != undefined && onCancel != null && cancelLabel ? (
                        <ActionButton
                          testID="dialog-cancel-button"
                          colorAccent={colorAccent}
                          style={cancelStyle}
                          containerStyle={cancelContainerStyle}
                          onPress={onCancel}
                          label={cancelLabel}
                        />
                      ) : null}
                      {onOk != undefined && onOk != null ? (
                        <ActionButton
                          testID="dialog-ok-button"
                          colorAccent={colorAccent}
                          style={okStyle}
                          containerStyle={okContainerStyle}
                          onPress={onOk}
                          label={okLabel}
                        />
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </TouchableWithoutFeedback>

              { hasBottomSpace && <Separator height={bottomSpace ? bottomSpace : 0} isHR extraStyle={{backgroundColor:'white'}} /> }
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

    </Modal>
  );
};

const styles = StyleSheet.create({
  backgroundOverlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundOverlay,
  },
  modalContainer: {
    marginHorizontal: 16,
    marginVertical: 106,
    width: width * 0.8,
    elevation: 24,
    overflow: "hidden"
  },
  modalContainerPadding: {
    paddingTop: 24
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  titleContainerScrolled: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.androidBorderColor
  },
  contentContainer: {
    flex: -1
  },
  contentContainerPadding: {
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  contentContainerScrolled: {
    flex: -1,
    maxHeight: height - 264 // (106px vertical margin * 2) + 52px
  },
  contentContainerScrolledPadding: {
    paddingHorizontal: 24
  },
  actionsContainer: {
    height: 52,
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingLeft: 8
  },
  actionsContainerScrolled: {
    height: 52,
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingLeft: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.androidBorderColor
  },
  actionContainer: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    minWidth: 64,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5
  }
});

MaterialDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  cancelLabel: PropTypes.string,
  okLabel: PropTypes.string,
  title: PropTypes.string,
  titleColor: PropTypes.string,
  titleStyle: PropTypes.string,
  backgroundColor: PropTypes.string,
  colorAccent: PropTypes.string,
  cancelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  okStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  cancelContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  okContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  scrolled: PropTypes.bool,
  addPadding: PropTypes.bool
};

MaterialDialog.defaultProps = {
  okLabel: "OK",
  cancelLabel: "CANCEL",
  title: undefined,
  titleColor: colors.androidPrimaryTextColor,
  backgroundColor: colors.background,
  colorAccent: colors.androidColorAccent,
  cancelStyle: {},
  okStyle: {},
  cancelContainerStyle: {},
  okContainerStyle: {},
  scrolled: false,
  addPadding: true,
  onOk: undefined,
  onCancel: undefined
};

ActionButton.propTypes = {
  testID: PropTypes.string.isRequired,
  colorAccent: PropTypes.string.isRequired,
  cancelStyle: PropTypes.object,
  okStyle: PropTypes.object,
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};

export default MaterialDialog;
