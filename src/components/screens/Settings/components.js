import React, { Component } from "react";
import { ScrollView, Text, View } from "react-native";
import CustomSwitch from "react-native-customisable-switch";
import { commonText } from "../../../common.styles";
import { setOption, hotelSearchIsNative } from '../../../config-settings'


const OptionSwitch = (props) => {
  let { label, labelOn, labelOff, description, value, onChange } = props;

  (!label) && (label = (labelOn && labelOff) ? (value ? labelOn : labelOff) : "");
  (!description) && (description='')

  return (
    <View style={{width: "100%", paddingVertical: 10, flexDirection: 'column', marginVertical: 10}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={{...commonText, fontSize: 16, fontWeight: "bold", marginTop: 7}}>{label}</Text>
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
            containerStyle={{marginBottom: 5}}
          />
      </View>
      <Text style={{...commonText, marginTop: 5, fontSize: 12, marginRight: 55}}>{description}</Text>
    </View>
  )
}

class SettingsContent extends Component {
  constructor(props) {
    super(props);

    this.toggleOption = this.toggleOption.bind(this);
    this.onSwitchChangeFactory = this.onSwitchChangeFactory.bind(this);
  }
  
  toggleOption(option) {
    switch (option) {
      case EXPERIMENTAL_OPTIONS.SEARCH:
        setOption(EXPERIMENTAL_OPTIONS.SEARCH, !hotelSearchIsNative.step1Results);
        break;
        
      default:
        break;
    }
    
    this.forceUpdate();
  }

  onSwitchChangeFactory(option) {
    const owner = this;

    return (
      function () {
        owner.toggleOption(option);
      }
    )
  }

  render() {
    const { style } = this.props;

    return (
      <ScrollView showsHorizontalScrollIndicator={false} style={{ width: "100%" }}>
        <View style={[styles.body, style]}>
          <OptionSwitch
            onChange={this.onSwitchChangeFactory(EXPERIMENTAL_OPTIONS.SEARCH)}
            value={hotelSearchIsNative.step1Results}
            label="Quick Search"
            description="Enables a new experimental search. Map view is currently not available. Current features include - compact list of hotels, information about matches count, quick filter, UX and UX touches, etc."
          />
        </View>
      </ScrollView>
    )
  }
}

const EXPERIMENTAL_OPTIONS = {
  SEARCH: "experimental-search",
}


// named exports
export { SettingsContent, OptionSwitch, EXPERIMENTAL_OPTIONS }