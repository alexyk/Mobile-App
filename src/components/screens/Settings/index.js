import { ScrollView, Text, View } from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";
import Switch from "react-native-customisable-switch";
import BackButton from "../../atoms/BackButton";
import styles from "./styles";
import { hotelSearchIsNativew, setOption, hotelSearchIsNative } from '../../../config-settings'


class Settings extends Component {

  constructor(props) {
    super(props);
  }


  render() {
    return (
      <View style={styles.container}>
        <View style={styles.navContainer}>
          <View style={styles.titleConatiner}>
            <BackButton style={styles.closeButton} onPress={() => this.props.navigation.goBack()} />
            <Text style={styles.title}>Settings</Text>
          </View>
        </View>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          style={{ width: "100%" }}
        >
          <View style={styles.body}>
            <View style={styles.topContainer}>
              
            </View>

            <View
              style={[styles.lineStyle, { marginLeft: 0, marginRight: 0 }]}
            />
            <OptionSwitch
              onChange={() => setOption(EXPERIMENTAL_OPTIONS.SEARCH, !hotelSearchIsNative.step1Results)}
              value={hotelSearchIsNative.step1Results}
            />
            
          </View>
        </ScrollView>
      </View>
    );
  }
}

const OptionSwitch = (props) => {
  const { value, onChange } = props;

  return (
    <Switch
      value={value}
      onChangeValue={onChange}
      activeTextColor="#DA7B61"
      activeBackgroundColor="#DA7B61"
      inactiveBackgroundColor="#e4a193"
      switchWidth={62}
      switchBorderColor="#e4a193"
      switchBorderWidth={1}
      buttonWidth={30}
      buttonHeight={30}
      buttonBorderRadius={15}
      buttonBorderColor="#fff"
      buttonBorderWidth={0}
      padding={false}
    />
  )
}

const EXPERIMENTAL_OPTIONS = {
  SEARCH: "experimental-search",

}

const mapStateToProps = state => {
  return {
    loginDetails: state.userInterface.loginDetails
  };
};

export default connect(mapStateToProps)(Settings);
