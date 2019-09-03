import React from "react";
import { View, Platform } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import lodash from 'lodash';
import { defaultStyle, defaultPickerStyle } from "./styles";


function LTPicker(props) {
  const { id, value, data, styles, extraDataOnChange, placeholder, onValueChange } = props;

  // styles
  let pickerStyle = defaultPickerStyle;
  let containerStyle = defaultStyle.container;
  const { picker, container } = styles || {};
  if (picker) {
    pickerStyle = lodash.merge({}, pickerStyle, {inputAndroid:picker, inputIOS:picker});
  }
  if (container) {
    containerStyle = lodash.merge({}, containerStyle, container)
  }

  let pickerRendered = (
    <RNPickerSelect
      key={id}
      value={value}
      items={data}
      placeholder={placeholder || ""}
      onValueChange={value => onValueChange(value, extraDataOnChange)}
      style={pickerStyle}
    />
  );

  if (Platform.OS == "ios") {
    return pickerRendered;
  } else {
      return (
        <View style={containerStyle}>
          {pickerRendered}
        </View>
      )
  }
}


export default LTPicker;