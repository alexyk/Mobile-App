import React, { Component } from "react";
import { Platform, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { connect } from "react-redux";
import Image from "react-native-remote-svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RNPickerSelect from "react-native-picker-select";
import Switch from "react-native-customisable-switch";
import Toast from "react-native-simple-toast";
import PhoneInput from "react-native-phone-input";
import styles from "./styles";
import { validateEmail, validateName, validatePhone } from "../../../../utils/validation";
import SmartInput from "../../../atoms/SmartInput";
import WhiteBackButton from "../../../atoms/WhiteBackButton";
import requester from "../../../../initDependencies";
import LTIcon from "../../../atoms/LTIcon";
import { serverRequest } from "../../../../services/utilities/serverUtils";
import { commonText } from "../../../../common.styles";
import InvisibleComponentFactory from "../../../atoms/InvisibleComponentFactory";
import lang from "../../../../language";
import { processPhoneInput } from "../../utils";


class CreateAccount extends Component {
  constructor(props) {
    super(props);

    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onPhoneCountryChanged = this.onPhoneCountryChanged.bind(this);
    this.onPhonePressConfirm = this.onPhonePressConfirm.bind(this);

    this.state = {
      countries: [],
      countryStates: [],
      hasCountryState: false,
      initialCountryForPhone: null,
      countryCodeForPhone: null,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      userWantsPromo: true,
      checkZIndex: 1, // zIndex of switchCheckView
      countriesLoaded: false,
      country: undefined,
      countryState: undefined
    };
    this.animationTime = 150; // time for switch to slide from one end to the other

    const { params } = this.props.navigation.state;
    //console.log("CreateAccount", params);
    if (params != undefined && params != null) {
      this.state.firstName = params.firstName;
      this.state.lastName = params.lastName;
      this.state.email = params.email;
    }
  }

  componentWillMount() {
    this.setCountriesInfo();
  }

  componentDidMount() {
    this._phoneCountries = this.refs.phone.getAllCountries();
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.countries != prevProps.countries) {
      this.setCountriesInfo();
    }
  }

  showMessage(message) {
    Toast.showWithGravity(message, Toast.SHORT, Toast.CENTER);
  }

  setCountriesInfo() {
    countryArr = [];
    this.props.countries.map((item, i) => {
      countryArr.push({
        label: item.name,
        value: item
      });
    });
    this.setState({
      countries: countryArr,
      countriesLoaded: true
      // country: countryArr[0].value,
    });
  }

  hasCountryState = country => {
    if (country == undefined || country == 0) {
      return false;
    }

    return ["Canada", "India", "United States of America"].includes(
      country.name
    );
  };

  setCountryStates = states => {
    let countryStates = [];
    states.map((item, i) => {
      countryStates.push({
        label: item.name,
        value: item
      });
    });
    this.setState({
      countryStates
    });
  };


  onChangeHandler(property) {
    return value => {
      if (property == "phone") {
        const {value: processedValue } = processPhoneInput(this.phone, value);
        value = processedValue;
      }      
      this.setState({ [property]: value });
    };
  }

  onPhonePressConfirm() {
    const _this = this;
    setImmediate(() => _this.refs.phone.focus());
  }

  onPhoneCountryChanged(countryId) {
    let { phoneNumber } = this.state;
    let countryCodeForPhone = countryId;
    const { isValid, value } = processPhoneInput(this.refs.phone, phoneNumber);

    if (!isValid) {
      this.setState({phoneNumber: value, countryCodeForPhone});
    } else {
      this.setState({countryCodeForPhone});
    }
  }

  onCountrySelected = value => {
    const hasCountryState = this.hasCountryState(value);
    const initialCountryForPhone = (value ? value.code.toLowerCase() : '');

    this.setState({
      country: value != 0 ? value : undefined,
      countryStates: [],
      hasCountryState: hasCountryState,
      countryState: "",
      countryCodeForPhone: initialCountryForPhone,
      initialCountryForPhone
    });
    this.refs.phone.selectCountry(initialCountryForPhone);

    if (hasCountryState) {
      serverRequest(this, requester.getStates, [value.id], 
        data => {
          this.setCountryStates(data)
        }
      );
    }
  };

  // TODO: Instead of this method - consider extending PhoneNumber form 'react-native-phone-input' to have getCountryName() or similar method
  getPhoneCountry(code) {
    let phoneCountry = ` with code ${code.toUpperCase()}`;

    try {
      let matches = this._phoneCountries.filter(item => item.iso2 == countryCodeForPhone);
      if (matches.length == 0) {
        phoneCountry = matches[0].name;
      }
    } catch (error) {}

    return phoneCountry;
  }

  goToNextScreen() {
    const { firstName, lastName, email, phoneNumber, country, countryState, hasCountryState, userWantsPromo, countryCodeForPhone } = this.state;

    if (!validateName(firstName)) {
      this.showMessage("First name should contain at least 2 latin letters.");
      this.refs.firstName.focus();
      return;
    }
    if (!validateName(lastName)) {
      this.showMessage("Last name should contain at least 2 latin letters.");
      this.refs.lastName.focus();
      return;
    }
    if (!validateEmail(email)) {
      this.showMessage("Please enter a valid email.");
      this.refs.email.focus();
      return;
    }

    if (country === undefined || country === null) {
      this.showMessage("Please choose your country of residence.");
      return;
    }

    if (hasCountryState && !countryState) {
      this.showMessage("Please Select State of Country.");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      let message;

      if (countryCodeForPhone != country.code.toLowerCase()) {
        message = lang.TEXT.PHONE_NUMBER_INVALID;
        message = message.replace('%1', phoneNumber).replace('%2', this.getPhoneCountry(countryCodeForPhone));
      } else {
        message = lang.TEXT.PHONE_NUMBER_INVALID_RESIDENCE;
        message = message.replace('%1', phoneNumber).replace('%2', " " + country.name);
      }

      this.showMessage(message);
      this.refs.phone.focus();

      return;
    }

    // proceed if e-mail is not taken
    serverRequest(this, requester.getEmailFreeResponse, [email],
      data => {
        if (data.exist) {
          this.showMessage("This e-mail is taken, please use another one.");
          this.refs.email.focus();
        } else {
          this.props.navigation.navigate("CreatePassword", {
            firstName,
            lastName,
            email,
            phoneNumber,
            country: country.id,
            countryState: countryState.id,
            userWantsPromo
          });
        }
      });

  }

  /**
   * hide component but still render it (it has ref set)
   */
  _renderPhoneInput() {
    const { phoneNumber, initialCountryForPhone } = this.state;    
    const isVisible = (!!initialCountryForPhone);

    const visibleStyle = {
      flexDirection: "row",
      justifyContent: "space-between",
      borderRadius: 25,
      borderColor: "#e4a193",
      borderWidth: 1,
      paddingLeft: 10,
      height: 50
    }
    const visibleFlagStyle = {backgroundColor: 'transparent', borderColor: 'transparent'};

    const visibleProps = {
      ref: 'phone',
      autoFormat: true, 
      value: phoneNumber,
      initialCountry: initialCountryForPhone,
      textProps: {
        placeholder: 'Phone Number',
        keyboardType: 'phone-pad',
        textContentType: 'telephoneNumber',
      },
      flagStyle: visibleFlagStyle,
      style: visibleStyle,
      textStyle: {...commonText, color: 'white'},
      onSelectCountry: this.onPhoneCountryChanged,
      onPressConfirm: this.onPhonePressConfirm,
      onChangePhoneNumber: this.onChangeHandler("phoneNumber"),
    }

    // prettier-ignore
    return (
      isVisible
        ? <PhoneInput {...visibleProps} />
        : <PhoneInput
            {...visibleProps}
            textComponent={InvisibleComponentFactory({style:{height:50, margin: 5}})}
            flagStyle={{ ...visibleFlagStyle, height: 0, width: 0 }}
            style={{ ...visibleStyle, borderWidth: 0, height: 0 }}
          />
    )
  }

  render() {
    const {
      firstName,
      lastName,
      email,
      userWantsPromo,
      checkZIndex
    } = this.state;
    const { params } = this.props.navigation.state;
    const { goBack } = this.props.navigation;

    let isEditableEmail = true;
    if (params != undefined && params != null) {
      if (params.email != null && params.email != "") {
        isEditableEmail = false;
      }
    }

    return (
      <KeyboardAwareScrollView
        style={styles.container}
        enableOnAndroid={true} //eslint-disable-line
        enableAutoAutomaticScroll={Platform.OS === "ios"}
      >
        <View style={styles.main_container}>
          <ScrollView
            style={styles.scrollView}
            automaticallyAdjustContentInsets={true}
          >
            <WhiteBackButton
              style={styles.closeButton}
              onPress={() => goBack()}
            />

            <View style={styles.lowOpacity}>
              <Image
                source={require("../../../../assets/get-started-white-outline.png")}
                style={styles.getStartedImage}
              />
            </View>
            <View style={styles.main}>
              <View style={styles.titleView}>
                <Text style={styles.titleText}>Create Account</Text>
              </View>

              <View style={styles.inputView}>
                <SmartInput
                  ref="firstName"
                  autoCorrect={false}
                  value={firstName}
                  onChangeText={this.onChangeHandler("firstName")}
                  placeholder="First Name"
                  placeholderTextColor="#fff"
                  rightIcon={validateName(firstName) ? null : "close"}
                />
              </View>

              <View style={styles.inputView}>
                <SmartInput
                  ref="lastName"
                  autoCorrect={false}
                  value={lastName}
                  onChangeText={this.onChangeHandler("lastName")}
                  placeholder="Last Name"
                  placeholderTextColor="#fff"
                  rightIcon={validateName(lastName) ? null : "close"}
                />
              </View>

              <View style={styles.inputView}>
                <SmartInput
                  ref="email"
                  editable={isEditableEmail}
                  selectTextOnFocus={isEditableEmail}
                  keyboardType="email-address"
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={email}
                  onChangeText={this.onChangeHandler("email")}
                  placeholder="Email"
                  placeholderTextColor="#fff"
                  rightIcon={validateEmail(email) ? null : "close"}
                />
              </View>

              <View style={styles.inputView}>
                <RNPickerSelect
                  items={this.state.countries}
                  placeholder={{
                    label: "Country of Residence",
                    value: 0
                  }}
                  onValueChange={value => this.onCountrySelected(value)}
                  style={{ ...pickerSelectStyles }}
                ></RNPickerSelect>
              </View>
              {this.state.hasCountryState && (
                <View style={styles.inputView}>
                  <RNPickerSelect
                    items={this.state.countryStates}
                    placeholder={{
                      label: "State of Residence",
                      value: 0
                    }}
                    onValueChange={value => {
                      this.setState({
                        countryState: value
                      });
                    }}
                    style={{ ...pickerSelectStyles }}
                  ></RNPickerSelect>
                </View>                
              )}

              <View style={styles.inputView}>
                { this._renderPhoneInput() }
              </View>

              <View style={styles.finePrintView}>
                <Text style={styles.finePrintText}>
                  I'd like to receive promotional communications, including
                  discounts, surveys and inspiration via email, SMS and phone.
                </Text>

                <View style={styles.switchContainer}>
                  {userWantsPromo ? (
                    <View
                      style={[styles.switchCheckView, { zIndex: checkZIndex }]}
                    >
                      <LTIcon
                        textStyle={styles.switchCheckText}
                        name={"check"}
                      />
                    </View>
                  ) : null}
                  <Switch
                    value={userWantsPromo}
                    onChangeValue={() => {
                      this.setState({
                        userWantsPromo: !userWantsPromo,
                        checkZIndex: 0
                      });
                      setTimeout(() => this.setState({ checkZIndex: 1 }), 150);
                    }}
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
                    animationTime={this.animationTime}
                    padding={false}
                  />
                </View>
              </View>

              <View style={styles.nextButtonView}>
                <TouchableOpacity
                  disabled={false}
                  onPress={() => this.goToNextScreen()}
                >
                  <View style={styles.nextButton}>
                    <LTIcon textStyle={styles.buttonText} name={"arrowRight"} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const pickerSelectStyles = {
  inputIOS: {
    height: 50,
    fontSize: 17,
    paddingLeft: 20,
    paddingTop: 13,
    paddingRight: 10,
    paddingBottom: 12,
    color: "#fff",
    fontFamily: "FuturaStd-Light"
  },

  icon: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 7.5,
    borderTopColor: "#fff",
    borderRightWidth: 7.5,
    borderRightColor: "transparent",
    borderLeftWidth: 7.5,
    borderLeftColor: "transparent",
    width: 0,
    height: 0,
    top: 20,
    right: 12
  },

  placeholderColor: "#fff",

  inputAndroid: {
    marginLeft: 12,
    color: "white"
  },

  underline: {
    borderTopWidth: 0,
    borderTopColor: "#888988",
    marginHorizontal: 4
  },
  viewContainer: {
    borderColor: "#e4a193",
    borderWidth: 1,
    borderRadius: 25,
    height: 50
  },
  icon: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 5,
    borderTopColor: "white",
    borderRightWidth: 5,
    borderRightColor: "transparent",
    borderLeftWidth: 5,
    borderLeftColor: "transparent",
    width: 0,
    height: 0,
    top: 20,
    right: 15
  }
};

let mapStateToProps = state => {
  return {
    countries: state.country.countries
  };
};

export default connect(mapStateToProps)(CreateAccount);
// export default CreateAccount;
