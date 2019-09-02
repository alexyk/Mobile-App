import { Text, TextInput, View } from "react-native";
import React, { Component } from "react";
import RNPickerSelect from "react-native-picker-select";

import PropTypes from "prop-types";
import styles from "./styles";
import { orderbyPickerSelectStyles } from "../HotelFilters/styles";
import { commonText } from "../../../../common.styles";


export default class GuestFormRow extends Component {
  static propTypes = {
    itemIndex: PropTypes.number,
    onFirstNameChange: PropTypes.func.isRequired,
    onLastNameChange: PropTypes.func.isRequired,
    onGuestTitleUpdate: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      title: "Mr",
      firstName: "",
      lastName: "",
      titleSelectItems: [
        { value: "Mr", label: "Mr" },
        { value: "Mrs", label: "Mrs" }
      ]
    };

    this._onGenderChange = this._onGenderChange.bind(this);
    this._onChangeText = this._onChangeText.bind(this);
  }

  componentDidMount() {
    this.setState({ ...this.props.guest });
  }

  _onGenderChange(value, index) {
    this.setState({ title: value });

    const { itemIndex, onGuestTitleUpdate } = this.props;
    onGuestTitleUpdate(itemIndex, value);
  }

  _onChangeText(text) {
    this.props.onFirstNameChange(this.props.itemIndex, text);
    this.setState({ firstName: text });
  }

  _renderGenderOrAge(isAChild, age) {
    if (isAChild) {
      return <Text style={{...commonText, fontSize:14, color:'grey',marginBottom: 10,fontWeight: "200"}}>aged {age}</Text>;
    } else {
      return (
        <View style={styles.titleContainer}>
          <RNPickerSelect
            placeholder={{ label: "", value: null }}
            style={orderbyPickerSelectStyles}
            value={this.state.title}
            items={this.state.titleSelectItems}
            onValueChange={this._onGenderChange}
          />
        </View>
      );
    }
  }

  _renderFirstName() {
    const { itemIndex } = this.props;
    const { firstName } = this.state;

    return (
      <View style={styles.firstNameFlex}>
        <TextInput
          style={[styles.formField]}
          onChangeText={this._onChangeText}
          placeholder="First Name"
          underlineColorAndroid="#fff"
          value={firstName}
        />
      </View>
    );
  }

  _renderLastName() {
    const { onLastNameChange, itemIndex } = this.props;
    const { lastName } = this.state;

    return (
      <View style={styles.lastNameFlex}>
        <TextInput
          style={styles.formField}
          onChangeText={text => {
            onLastNameChange(itemIndex, text);
            this.setState({ lastName: text });
          }}
          placeholder="Last Name"
          underlineColorAndroid="#fff"
          value={lastName}
        />
      </View>
    );
  }

  _renderType(isAChild, age, no, roomIndex) {
    if (isAChild) {
      return <Text style={styles.labelGuest}>Young Guest {no}</Text>
    } else {
      return <Text style={styles.labelGuest}>Guest {no}</Text>
    }
  }

  render() {
    const { itemIndex, guest } = this.props;
    const { age, roomIndex } = guest;
    const no = parseInt(itemIndex) + 1;
    const isAChild = (age != null);

    return (
      <View style={styles.guestInfoWrapper} key={`${itemIndex}`}>
        {this._renderType(isAChild, age, no, roomIndex)}
        <View style={styles.inputFieldsView}>
          {this._renderGenderOrAge(isAChild, age)}
          {this._renderFirstName()}
          {this._renderLastName()}
        </View>
      </View>
    );
  }
}
