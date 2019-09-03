import React, { Component } from "react";
import { Text, TextInput, View } from "react-native";

import PropTypes from "prop-types";
import styles from "./styles";
import LTPicker from "../../../molecules/LTPicker";
import { hasTwoLetters } from "../../../../utils/validation";


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
    this._ready = false;
    this._editStatus = {0: false, 1: false};

    this._focusNext = this._focusNext.bind(this);
    this._onGenderChange = this._onGenderChange.bind(this);
    this._onChangeText = this._onChangeText.bind(this);
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
    const { _ready, _editStatus } = this;
    const { guestIndex } = this.props;

    if (!_ready) {
      _editStatus[index] = (hasTwoLetters(text));
      if (_editStatus[0] && _editStatus[1]) {
        this._ready = true;
      }
    }

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
    const { _ready, _editStatus } = this;
    const { textRefs } = this.props;
    const { text } = event.nativeEvent
    const isReady = (
      (index == 0 && _editStatus[0])
      || (index == 1 && _ready)
    );

    if (isReady && hasTwoLetters(text)) {
      const { [id+1]: txt } = textRefs || {};
      
      if (txt) {
        setTimeout(txt.focus, 80);
      } else {
        textRefs[id].blur();
      }
    }
  }

  _renderFirstName(roomIndex, guestIndex) {
    const { textRefs, guest } = this.props;
    const { firstName } = guest;
    const { _firstId } = this;

    return (
      <View key={`first_${roomIndex}_${guestIndex}`} style={styles.firstNameFlex}>
        <TextInput
          ref={ref => textRefs[_firstId] = ref}
          onSubmitEditing={event => this._focusNext(event, _firstId, 0)}
          blurOnSubmit={false}
          style={styles.formField}
          onChangeText={(value) => this._onChangeText(value, 0)}
          placeholder="First Name"
          underlineColorAndroid="#fff"
          value={firstName}
        />
      </View>
    );
  }

  _renderLastName(roomIndex, guestIndex) {
    const { textRefs, guest } = this.props;
    const { lastName } = guest;
    const { _lastId } = this;

    return (
      <View key={`first_${roomIndex}_${guestIndex}`} style={styles.lastNameFlex}>
        <TextInput
          ref={ref => textRefs[_lastId] = ref}
          onSubmitEditing={event => this._focusNext(event, _lastId, 1)}
          blurOnSubmit={false}
          style={styles.formField}
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
      return <Text style={styles.labelGuest}>Young Guest {no}</Text>
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

    return (
      <View key={`${roomIndex}_${guestIndex}_${id}`} style={styles.guestInfoWrapper} key={`${guestIndex}`}>
        <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
          {this._renderType(isAChild, age, no, roomIndex)}
          {this._renderGenderOrAge(isAChild, age, title)}
        </View>
        <View style={styles.inputFieldsView}>
          {this._renderFirstName(roomIndex, guestIndex)}
          {this._renderLastName(roomIndex, guestIndex)}
        </View>
      </View>
    );
  }
}
