import React, { Component } from "react";
import { ScrollView, Text, View } from "react-native";
import { connect } from "react-redux";
import BackButton from "../../atoms/BackButton";
import styles from "./styles";
import { setOption, hotelSearchIsNative } from '../../../config-settings'
import { OptionSwitch } from './components';
import { log } from "js-tools";


class Settings extends Component {

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
    return (
      <View style={styles.container}>
        <View style={styles.navContainer}>
          <View style={styles.titleContainer}>
            <BackButton style={styles.closeButton} onPress={() => this.props.navigation.goBack()} />
            <Text style={styles.title}>Settings</Text>
          </View>
        </View>
        <ScrollView showsHorizontalScrollIndicator={false} style={{ width: "100%" }}>
          <View style={styles.body}>
            <OptionSwitch
              onChange={this.onSwitchChangeFactory(EXPERIMENTAL_OPTIONS.SEARCH)}
              value={hotelSearchIsNative.step1Results}
              label="Quick Search"
              description="Enables new experimental search. Results are shown only as a list - currently no map option"
            />
          </View>
        </ScrollView>
      </View>
    );
  }
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
