import React, { Component } from "react";
import { Text, View } from "react-native";
import { connect } from "react-redux";
import BackButton from "../../atoms/BackButton";
import styles from "./styles";
import { SettingsContent } from './components';



class Settings extends Component {
  constructor(props) {
    super(props);
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

        <SettingsContent style={{marginHorizontal: 10}} />

      </View>
    );
  }
}


const mapStateToProps = state => {
  return {
    loginDetails: state.userInterface.loginDetails
  };
};

export default connect(mapStateToProps)(Settings);
