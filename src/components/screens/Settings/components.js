import React, { Component } from "react";
import { ScrollView, Text, View, Platform } from "react-native";
import CustomSwitch from "react-native-customisable-switch";
import { commonText } from "../../../common.styles";
import { setOption, hotelSearchIsNative } from '../../../config-settings'
import { TextInput } from "react-native-gesture-handler";


const OptionSwitch = (props) => {
  let { label, labelOn, labelOff, description, value, onChange } = props;

  (!label) && (label = (labelOn && labelOff) ? (value ? labelOn : labelOff) : "");
  (!description) && (description='');
  const borderWidth = (Platform.OS == 'android' ? 1 : 0);


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
            switchBorderWidth={borderWidth}
            switchBorderColor="#e4a193"
            buttonWidth={30}
            buttonHeight={30}
            buttonBorderRadius={15}
            buttonBorderColor="#555"
            buttonBorderWidth={borderWidth}
            padding={false}
            containerStyle={{marginBottom: 5}}
          />
      </View>
      <Text style={{...commonText, marginTop: 5, fontSize: 12, marginRight: 0, textAlign: "justify"}}>{description}</Text>
    </View>
  )
}

class DebugOptionEdit extends Component {
  timeoutId = null;

  constructor(props) {
    super(props);
    this.state = {value: props.value, valueAsText: JSON.stringify(props.value)};
    this.onChangeText = this.onChangeText.bind(this);
  }

  onChangeText(text) {
    const { name, value, configDebug } = this.props;

    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
    }

    let valueAsText = text;
    let valueParsed;
    try {
      valueParsed = eval(text);
    } catch (error) {}

    const _this = this;
    this.timeoutId = setTimeout(() => {
      if (valueParsed != null) {
        configDebug.setDebugOption(name, valueParsed)
        _this.setState({value: valueParsed, valueAsText: JSON.stringify(valueParsed)});
      } else {
        _this.setState({valueAsText: JSON.stringify(value)});
      }
    }, 1000);
  
    this.setState({valueAsText})
  }


  render() {
    const { valueAsText } = this.state;
    const { name } = this.props;

    return (
      <View style={{width: "100%", paddingVertical: 5, flexDirection: 'column', height: 40}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{...commonText, fontSize: 14, fontWeight: "bold", width: 150}}>{name}</Text>
          <TextInput value={valueAsText} onChangeText={this.onChangeText} style={{...commonText, fontSize:13, borderWidth: 0.5, padding: 3, paddingHorizontal: 3, width: 100, marginRight: 10}} autoCapitalize="none" />
        </View>
      </View>
    )
  }
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

  _renderDebugOptions() {
    if (!__DEV__) {
      return null;
    }

    const configDebug = require('../../../config-debug');

    return (
      <View style={{height: 200}}>
        <ScrollView showsHorizontalScrollIndicator={false} style={{ width: "100%" }}>
          <DebugOptionEdit configDebug={configDebug} name="customFilter" value={configDebug.consoleFilters.customFilter}  />
          <DebugOptionEdit configDebug={configDebug} name="consoleFilter" value={configDebug.consoleFilter}  />
          <DebugOptionEdit configDebug={configDebug} name="skipEmailVerify" value={configDebug.skipEmailVerification}  />
          <DebugOptionEdit configDebug={configDebug} name="reduxLog" value={configDebug.reduxConsoleLoggingEnabled}  />
          <DebugOptionEdit configDebug={configDebug} name="testFlow" value={configDebug.testFlow}  />
          <DebugOptionEdit configDebug={configDebug} name="dialogDebug" value={configDebug.messageDialogDebug}  />
          <DebugOptionEdit configDebug={configDebug} name="isOnline" value={configDebug.isOnline}  />
        </ScrollView>
      </View>
    )
  }

  render() {
    const { style } = this.props;

    return (
      <View style={[styles.body, style]}>
        <OptionSwitch
          onChange={this.onSwitchChangeFactory(EXPERIMENTAL_OPTIONS.SEARCH)}
          value={hotelSearchIsNative.step1Results}
          label="Quick Search"
          description="Enables a new experimental search. Map view is currently not available. Current features include - compact list of hotels, information about matches count, quick filter, UX and UX touches, etc."
        />
        { this._renderDebugOptions() }
      </View>
    )
  }
}

const EXPERIMENTAL_OPTIONS = {
  SEARCH: "experimental-search",
}


// named exports
export { SettingsContent, OptionSwitch, EXPERIMENTAL_OPTIONS }