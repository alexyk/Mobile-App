import React, { Component } from "react";
import { ScrollView, Text, TextInput, View, Platform } from "react-native";
import CustomSwitch from "react-native-customisable-switch";
import { commonText } from "../../../common.styles";
import { setOption, hotelSearchIsNative } from '../../../config-settings';
import DBG from "../../../config-debug";
import { refreshRequester } from "../../../initDependencies";


const OptionSwitch = (props) => {
  let { label, labelOn, labelOff, description, value, onChange, labelStyle, containerStyle, switchStyle, descriptionStyle } = props;

  (!label) && (label = (labelOn && labelOff) ? (value ? labelOn : labelOff) : "");
  (!description) && (description='');
  const borderWidth = (Platform.OS == 'android' ? 1 : 0);


  return (
    <View style={{width: "100%", paddingVertical: 10, flexDirection: 'column', marginVertical: 10, ...containerStyle}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={{...commonText, fontSize: 16, fontWeight: "bold", marginTop: 7, ...labelStyle}}>{label}</Text>
        <CustomSwitch
            value={value}
            onChangeValue={onChange}
            activeTextColor="#DA7B61"
            activeBackgroundColor="#DA7B61"
            inactiveBackgroundColor="#4445"
            switchWidth={42}
            switchHeight={23}
            switchBorderWidth={borderWidth}
            switchBorderColor="#e4a193"
            buttonWidth={20}
            buttonHeight={20}
            buttonBorderRadius={15}
            buttonBorderColor="#555"
            buttonBorderWidth={borderWidth}
            padding={false}
            containerStyle={{marginBottom: 5, ...switchStyle}}
          />
      </View>
      <Text style={{...commonText, marginTop: 5, fontSize: 12, marginRight: 0, textAlign: "justify", ...descriptionStyle}}>{description}</Text>
    </View>
  )
}

class DebugOptionEdit extends Component {
  timeoutId = null;

  constructor(props) {
    super(props);

    if (!props.isBool) {
      this.state = {value: props.value, valueAsText: JSON.stringify(props.value)};
    }

    this.toggleDebugOption = this.toggleDebugOption.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
  }
  

  onChangeText(text) {
    const { name } = this.props;

    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
    }

    let valueAsText = text;
    let valueParsed;
    let jsonError;

    try {
      valueAsText = valueAsText.replace(/[“”]/g, '"');
      valueAsText = valueAsText.replace(/[’]/g, "'");
      valueParsed = JSON.parse(valueAsText);
      if (valueAsText != text) {
        this.setState({valueAsText});
      }
    } catch (error) {
      jsonError = error;
    }

    const _this = this;
    this.timeoutId = setTimeout(() => {
      if (valueParsed != null && !jsonError) {
        DBG.setDebugOption(name, valueParsed);
        _this.setState({value: valueParsed, valueAsText: JSON.stringify(valueParsed)});
      }
      this.setState({jsonError});
    }, 200);
  
    this.setState({valueAsText});
  }


  toggleDebugOption() {
    const owner = this;
    
    return function () {
      const { name, value, parent } = owner.props;
      DBG.setDebugOption(name, !value);
      parent.forceUpdate();
      if (name == "isOnline") {
        refreshRequester();
      }
    }
  }


  _renderSwitch() {
    const { name, value, error } = this.props;

    return (
      <OptionSwitch
        onChange={this.toggleDebugOption()}
        value={value}
        label={name}
        description=""
        style={{marginVertical: 0, paddingVertical: 0}}
        labelStyle={{fontSize: 13, marginTop: 5}}
        containerStyle={{marginVertical: 0, paddingVertical: 5}}
        switchStyle={{marginBottom: 0}}
        error={error}
      />
    )
  }

  _renderInput() {
    const { valueAsText, jsonError } = this.state;
    const { name } = this.props;

    const inputStyle = (
      Platform.OS == "android"
        ? {fontSize:11, borderWidth: 0.5, paddingHorizontal: 3, width: 100, marginRight: 10}
        : {fontSize:13, borderWidth: 0.5, paddingHorizontal: 3, width: 100, marginRight: 10}
    )

    return (
      <View style={{width: "100%", paddingVertical: 0, flexDirection: 'column', height: 40}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{...commonText, fontSize: 14, marginTop: 5, fontWeight: "bold", width: 150}}>{name}</Text>
          <TextInput value={valueAsText} onChangeText={this.onChangeText} style={inputStyle} autoCapitalize="none" />
        </View>
        {jsonError && <Text style={{...commonText, fontSize: 9, textAlign: 'right', color: 'red', marginTop: 5}}>{`${jsonError}`}</Text>}
      </View>
    )
  }


  render() {
    if (this.props.isBool) {
      return this._renderSwitch();
    } else {
      return this._renderInput();
    }
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
    if (!__DEV__ || !DBG.debugSettingsOption) {
      return null;
    }
    
    return (
      <View style={{height: 400}}>
        <ScrollView showsHorizontalScrollIndicator={false} style={{ width: "100%" }}>
          <DebugOptionEdit parent={this} name="customFilter" value={DBG.filtersConfig.custom}  />
          <DebugOptionEdit parent={this} name="reduxLog" value={DBG.reduxConsoleLoggingEnabled} isBool />
          <DebugOptionEdit parent={this} name="isOnline" value={DBG.isOnline} isBool />
          <DebugOptionEdit parent={this} name="skipEmailVerify" value={DBG.skipEmailVerification} isBool />
          <DebugOptionEdit parent={this} name="reactotronHost" value={DBG.reactotronHost}  />
          <DebugOptionEdit parent={this} name="consoleFilter" value={DBG.consoleFilter}  />
          <DebugOptionEdit parent={this} name="dialogDebug" value={DBG.messageDialogDebug} isBool />
          <DebugOptionEdit parent={this} name="testFlow" value={DBG.testFlow}  />
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