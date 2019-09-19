import React, { Component } from "react";
import { Text, TextInput, View } from "react-native";

import PropTypes from "prop-types";
import styles from "./styles";
import LTPicker from "../../../molecules/LTPicker";
import { validateName } from "../../../../utils/validation";
import { OPTIONS } from "../../../../config-settings";


export default class GuestFormRow extends Component {
  static propTypes = {
    guestIndex: PropTypes.number,
    onFirstNameChange: PropTypes.func.isRequired,
    onLastNameChange: PropTypes.func.isRequired,
    onGuestTitleUpdate: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this._titleSelectItems = [
      { value: "Mr", label: "Mr" },
      { value: "Mrs", label: "Mrs" }
    ]
    this._isReady = false;

    this._focusNext = this._focusNext.bind(this);
    this._onGenderChange = this._onGenderChange.bind(this);
    this._onChangeText = this._onChangeText.bind(this);
  }

  componentDidMount() {
    setTimeout( () => this._isReady = true, 500);
  }

  _onGenderChange(value) {
    const { roomIndex, guestIndex, onGuestTitleUpdate } = this.props;
    onGuestTitleUpdate(roomIndex, guestIndex, value);
  }

  /**
   * 
   * @param {String} text The changed text value
   * @param {Number} index index=0 -> first name, index=1 -> last name
   */
  _onChangeText(text, index) {
    const { guestIndex } = this.props;

    switch (index) {
      case 0:
        this.props.onFirstNameChange(guestIndex, text);
        break;
      case 1:
        this.props.onLastNameChange(guestIndex, text);
        break;
    }
  }

  _renderGenderOrAge(isAChild, age, title) {
    if (isAChild) {
      return (
        <Text style={styles.childAgeText}>Aged {age}</Text>
      )
    } else {
      const props = {
        id: `${isAChild}_${age}`,
        value: title,
        data: this._titleSelectItems, 
        extraDataOnChange: {},
        placeholder: { label: "", value: null },
        onValueChange: this._onGenderChange,
        styles: {picker: {width: 80, height:30}}
      };
      return <LTPicker {...props} />;
    }
  }

  _focusNext(event, id, index) {
    const { textRefs } = this.props;
    const { text } = event.nativeEvent

    if (this._isReady && validateName(text)) {
      const { [id+1]: txt } = textRefs || {};
      
      if (txt) {
        setTimeout(txt.focus, 80);
      } else {
        textRefs[id].blur();
      }
    }
  }

  _renderFirstName(roomIndex, guestIndex, id) {
    const { textRefs, guest, validationState } = this.props;
    const { firstName } = guest;
    const { _firstId } = this;
    const isValid = (validationState == null || !validationState.hasOwnProperty('first') )
    const validStyle = (isValid ? null : {backgroundColor: '#f004'});

    return (
      <View key={`first_${roomIndex}_${guestIndex}_${id}`} style={styles.firstNameFlex}>
        <TextInput
          ref={ref => textRefs[_firstId] = ref}
          onSubmitEditing={event => this._focusNext(event, _firstId, 0)}
          blurOnSubmit={false}
          style={[styles.formField, validStyle]}
          onChangeText={(value) => this._onChangeText(value, 0)}
          placeholder="First Name"
          underlineColorAndroid="#fff"
          value={firstName}
        />
      </View>
    );
  }

  _renderLastName(roomIndex, guestIndex, id) {
    const { textRefs, guest, validationState } = this.props;
    const { lastName } = guest;
    const { _lastId } = this;
    const isValid = (validationState == null || !validationState.hasOwnProperty('last') )
    const validStyle = (isValid ? null : {backgroundColor: '#f004'});

    return (
      <View key={`last_${roomIndex}_${guestIndex}_${id}`} style={styles.lastNameFlex}>
        <TextInput
          ref={ref => textRefs[_lastId] = ref}
          onSubmitEditing={event => this._focusNext(event, _lastId, 1)}
          blurOnSubmit={false}
          style={[styles.formField, validStyle]}
          onChangeText={(value) => this._onChangeText(value, 1)}
          placeholder="Last Name"
          underlineColorAndroid="#fff"
          value={lastName}
        />
      </View>
    );
  }

  _renderType(isAChild, age, no, roomIndex) {
    if (isAChild) {
      return <Text style={styles.labelGuest}>Guest {no} (child)</Text>
    } else {
      return <Text style={styles.labelGuest}>Guest {no}</Text>
    }
  }

  render() {
    const { guestIndex, guest, textRefs, id } = this.props;
    const { age, roomIndex, title } = guest;
    const no = guestIndex + 1;
    const isAChild = (age != null);
    this._firstId = id;
    this._lastId = id+1;
    textRefs.id += 2;

    if (isAChild && OPTIONS.guests.SKIP_CHILDREN_NAMES) {
      return null;
    }

    return (
      <View key={`${roomIndex}_${guestIndex}_${id}`} style={styles.guestInfoWrapper} key={`${guestIndex}`}>
        <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
          {this._renderType(isAChild, age, no, roomIndex)}
          {this._renderGenderOrAge(isAChild, age, title)}
        </View>
        <View style={styles.inputFieldsView}>
          {this._renderFirstName(roomIndex, guestIndex, id)}
          {this._renderLastName(roomIndex, guestIndex, id)}
        </View>
      </View>
    );
  }
}
