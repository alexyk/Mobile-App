import PropTypes from "prop-types";
import React, { Component } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { withNavigation } from "react-navigation";
import { autoCalendar } from "../../../config-debug";
import LTIcon from "../../atoms/LTIcon";
import styles from "./styles";

class DateAndGuestPicker extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // detach from current code execution (smoother animation)
    if (__DEV__ && autoCalendar) setImmediate(() => this.onCalendar());
  }

  onOption = () => {
    // detach from current code execution - avoiding button lock
    setImmediate(() => this.props.gotoOptions());
  };

  onGuests = () => {
    // detach from current code execution - avoiding button lock
    setImmediate(() => this.props.gotoGuests());
  };

  onSearch = () => {
    // detach from current code execution - avoiding button lock
    setImmediate(() => this.props.gotoSearch());
  };

  onCancel = () => {
    // detach from current code execution - avoiding button lock
    setImmediate(() => this.props.gotoCancel());
  };

  onCalendar = () => {
    // detach from current code execution - avoiding button lock
    setImmediate(() => this.props.navigation.navigate("CalendarScreen"));
  };

  _renderCheckInOutButtons(disabled, checkInDate, checkOutDate) {
    const checkInDateText = checkInDate || "Select Date";
    const checkOutDateText = checkOutDate || "------";
    const isCalendarDisabled = disabled || this.props.onDatesSelect == null;

    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={isCalendarDisabled ? null : this.onCalendar}
          style={
            checkInDate && checkOutDate
              ? styles.datesPickerViewComplete
              : styles.datesPickerViewIncomplete
          }
          disabled={isCalendarDisabled}
        >
          <View style={styles.datePickerView}>
            <Text
              style={
                isCalendarDisabled ? styles.label_disabled : styles.label
              }
            >
              Check In
            </Text>
            <Text style={styles.value}>{checkInDateText}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.datePickerView}>
            <Text
              style={
                isCalendarDisabled ? styles.label_disabled : styles.label
              }
            >
              Check Out
            </Text>
            <Text style={styles.value}>{checkOutDateText}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  _renderGuestsButton(disabled, adults, children) {
    const isGuestsDisabled = disabled || this.props.gotoGuests == null;
    
    return (
      <TouchableOpacity onPress={isGuestsDisabled ? null : this.onGuests} disabled={isGuestsDisabled}>
        <View style={adults + children ? styles.guestPickerViewComplete : styles.guestPickerViewIncomplete}>
          <Text style={isGuestsDisabled ? styles.label_disabled : styles.label}>Guests</Text>
          <Text style={styles.value}>{adults + children || "-"}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  _renderOptionsButton(disabled, customOptionsIcon) {
    const noOptions = disabled || this.props.gotoOptions == null;
    if (noOptions) {
      return null;
    }

    return (
      <TouchableOpacity disabled={disabled} onPress={this.onOption}>
        <View style={styles.optionsPickerViewIncomplete}>
          <LTIcon
            name={customOptionsIcon ? customOptionsIcon : 'settings'}
            size={28}
            color={disabled ? "#d9d9d9" : "#565656"}
            iconSet={"material"}
          />
        </View>
      </TouchableOpacity>
    )
  }

  _renderSearchButton(showSearchButton) {
    return (
      <TouchableOpacity onPress={this.onSearch}>
        <View style={showSearchButton ? styles.searchButtonView : { height: 0 }}>
          <Text style={showSearchButton ? styles.searchButtonText : { height: 0 }}>
            Search
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  _renderCancelButton(showCancelButton) {
    return (
      <TouchableOpacity onPress={this.onCancel}>
        <View style={showCancelButton ? styles.searchButtonView : { height: 0 }}>
          <Text style={showCancelButton ? styles.searchButtonText : { height: 0 }}>
            Cancel
          </Text>
        </View>
      </TouchableOpacity>
    );
  }


  render() {
    const {
      checkInDate,
      checkOutDate,
      adults,
      children,
      disabled,
      showSearchButton,
      showCancelButton,
      containerStyle,
      customOptionsIcon
    } = this.props;

    return (
      <View style={[styles.container, containerStyle]}>

        <View style={styles.pickerRow}>
          { this._renderCheckInOutButtons(disabled, checkInDate, checkOutDate) }
          { this._renderGuestsButton(disabled, adults, children) }
          { this._renderOptionsButton(disabled, customOptionsIcon) }
        </View>

        { this._renderSearchButton(showSearchButton) }
        { this._renderCancelButton(showCancelButton) }

      </View>
    );
  }
}

DateAndGuestPicker.propTypes = {
  checkInDate: PropTypes.string.isRequired,
  checkOutDate: PropTypes.string.isRequired,
  onDatesSelect: PropTypes.func,
  adults: PropTypes.number.isRequired,
  children: PropTypes.number.isRequired,
  gotoSearch: PropTypes.func.isRequired,
  gotoCancel: PropTypes.func.isRequired,
  gotoGuests: PropTypes.func,
  gotoOptions: PropTypes.func,
  showSearchButton: PropTypes.bool.isRequired,
  showCancelButton: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  customOptionsIcon: PropTypes.bool,
};

DateAndGuestPicker.defaultProps = {
  checkInDate: "",
  checkOutDate: "",
  onDatesSelect: null,
  adults: 2,
  children: 0,
  gotoSearch: () => {},
  gotoCancel: () => {},
  gotoGuests: null,
  gotoOptions: null,
  showSearchButton: false,
  showCancelButton: false,
  disabled: false
};

export default withNavigation(DateAndGuestPicker);
