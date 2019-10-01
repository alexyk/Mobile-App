import React, { Component } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import PhoneInput from "react-native-phone-input";
import PropTypes from "prop-types";
import styles from "./styles";
import Toast from 'react-native-simple-toast';
import { validatePhoneIssues, PHONE_VALIDATION_ISSUES } from "../../../utils/validation";
import lang from "../../../language";
import { processPhoneInput } from "../../screens/utils";
import { getObjectFromPath } from "js-tools";


class EditPhoneModal extends Component {
  static propTypes = {
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    value: PropTypes.string
  };

  static defaultProps = {
    onSave: () => {},
    onCancel: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      isValid: false,
      value: "",
      initialCountryForPhone: ""
    };

    const countryCode = getObjectFromPath(props, 'parent.props.loginDetails.country.code');
    if (countryCode) {
      this.state.initialCountryForPhone = countryCode.toLowerCase();
    }

    this.updateInfo = this.updateInfo.bind(this);
    this.renderInfo = this.renderInfo.bind(this);
    this.onPhoneCountryChanged = this.onPhoneCountryChanged.bind(this);
    this.onPhoneChanged = this.onPhoneChanged.bind(this);
  }

  componentDidMount() {
    this.refs.phone.selectCountry(this.state.initialCountryForPhone);
    this.setState({value: this.props.phone});
    setImmediate(() => this.refs.phone.focus());
  }

  updateInfo() {
    const { value } = this.state;
    const { isValid } = processPhoneInput(this.refs.phone, value)

    if (isValid) {
      this.props.onSave(this.refs.phone.getValue());
    } else {      
      if (this.props.showMessage) {
        let message;
        const firstIssue = validatePhoneIssues(value);

        if (firstIssue && firstIssue != PHONE_VALIDATION_ISSUES.NA) {
          message = firstIssue;
        } else {
          // TODO: Implement this case
          // This case is currently not happening - it is prepared for more detailed verification with google validation
          message = lang.TEXT.PHONE_NUMBER_INVALID
                          .replace('%1', value)
                          .replace('%2','');
        }

        // this.props.showMessage('Phone Invalid', message, 'invalid-phone', 'message');
        Toast.showWithGravity(message, Toast.SHORT, Toast.CENTER);
      } else {
        throw new Error('[EditPhoneModal] "showMessage" need to be passed as a prop, for example: <EditPhoneModal showMessage={this.showMessage}  ... />');
      }
    }
  }

  renderInfo() {
    if (this.state.value) {
      return (
        <View>
          <Text style={styles.info}>Invalid PhoneNumber!</Text>
        </View>
      );
    }
  }

  onPhoneChanged(value) {
    const {value: processedValue } = processPhoneInput(this.refs.phone, value);
    this.setState({value:processedValue});
  }

  onPhoneCountryChanged(countryId) {
    // const { phoneNumber: lastValue } = this.props.parent.state;
    const { value } = this.state;    
    const { isValid, value: valueProcessed } = processPhoneInput(this.refs.phone, value);

    this.setState({value: valueProcessed});
  }

  render() {
    const { initialCountryForPhone } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Edit Phone</Text>

          {/* {!isValid && this.renderInfo()} */}

          <View style={styles.editContent}>
            <PhoneInput ref={'phone'}
              initialCountry={initialCountryForPhone}
              flagStyle={{backgroundColor: 'transparent', borderColor: 'transparent'}}
              value={this.state.value}
              onChangePhoneNumber={this.onPhoneChanged}
              onSelectCountry={this.onPhoneCountryChanged}
            />
          </View>
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => this.updateInfo()}>
              <View style={styles.SaveButton}>
                <Text style={styles.buttonTitle}> Ok </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.onCancel()}>
              <View style={styles.CancelButton}>
                <Text style={styles.buttonTitle}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

export default EditPhoneModal;
