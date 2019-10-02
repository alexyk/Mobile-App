import React from "react";
import { Text, View } from "react-native";
import CustomSwitch from "react-native-customisable-switch";
import { commonText } from "../../../common.styles";
import { SCREEN_SIZE } from "../../../utils/designUtils";


const OptionSwitch = (props) => {
  let { label, labelOn, labelOff, description, value, onChange } = props;

  (!label) && (label = (labelOn && labelOff) ? (value ? labelOn : labelOff) : "");
  (!description) && (description='')

  const width = SCREEN_SIZE.W - 110; // 110 is assumed Switch width + horizontal right padding/margin
                                     // TODO: Consider finding a better way to decide width for OptionSwitch

  return (
    <View style={{width: "100%", paddingVertical: 10, flexDirection: 'column'}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={{...commonText, fontSize: 16}}>{label}</Text>
        <CustomSwitch
            value={value}
            onChangeValue={onChange}
            activeTextColor="#DA7B61"
            activeBackgroundColor="#DA7B61"
            inactiveBackgroundColor="#4445"
            switchWidth={62}
            switchBorderWidth={value ? 1 : 0}
            switchBorderColor="#e4a193"
            buttonWidth={30}
            buttonHeight={30}
            buttonBorderRadius={15}
            buttonBorderColor="#fff"
            buttonBorderWidth={0}
            padding={false}
            // containerStyle={{backgroundColor: 'pink'}}
          />
      </View>
      <Text style={{...commonText, fontSize: 12, width}}>{description}</Text>
    </View>
  )
}


// named exports
export { OptionSwitch }