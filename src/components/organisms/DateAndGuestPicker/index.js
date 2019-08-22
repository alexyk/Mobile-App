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
    if (__DEV__ && autoCalendar) setTimeout(() => this.onCalendar());
  }

  onFilter = () => {
    // detach from current code execution - avoiding button lock
    setTimeout(() => this.props.gotoFilter());
  };

  onGuests = () => {
    // detach from current code execution - avoiding button lock
    setTimeout(() => this.props.gotoGuests());
  };

  onSearch = () => {
    // detach from current code execution - avoiding button lock
    setTimeout(() => this.props.gotoSearch());
  };

  onCancel = () => {
    // detach from current code execution - avoiding button lock
    setTimeout(() => this.props.gotoCancel());
  };

  onCalendar = () => {
    // detach from current code execution - avoiding button lock
    setTimeout(() => this.props.navigation.navigate("CalendarScreen"));
  };

  render() {
    const {
      checkInDate,
      checkOutDate,
      adults,
      children,
      showSearchButton,
      showCancelButton,
      disabled,
      isFilterable,
      containerStyle
    } = this.props;

    const checkInDateText = checkInDate || "Select Date";
    const checkOutDateText = checkOutDate || "------";

    const isCalendarDisabled = disabled || this.props.onDatesSelect == null;
    const isGuestsDisabled = disabled || this.props.gotoGuests == null;

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.pickerRow}>
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

          <TouchableOpacity
            onPress={isGuestsDisabled ? null : this.onGuests}
            disabled={isGuestsDisabled}
          >
            <View
              style={
                adults + children
                  ? styles.guestPickerViewComplete
                  : styles.guestPickerViewIncomplete
              }
            >
              <Text
                style={isGuestsDisabled ? styles.label_disabled : styles.label}
              >
                Guests
              </Text>
              <Text style={styles.value}>{adults + children || "-"}</Text>
            </View>
          </TouchableOpacity>
          {isFilterable && (
            <TouchableOpacity disabled={disabled} onPress={this.onFilter}>
              <View style={styles.optionsPickerViewIncomplete}>
                <LTIcon
                  name={"filter-list"}
                  size={28}
                  color={disabled ? "#d9d9d9" : "#565656"}
                  iconSet={"material"}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={this.onSearch}>
          <View
            style={showSearchButton ? styles.searchButtonView : { height: 0 }}
          >
            <Text
              style={showSearchButton ? styles.searchButtonText : { height: 0 }}
            >
              Search
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onCancel}>
          <View
            style={showCancelButton ? styles.searchButtonView : { height: 0 }}
          >
            <Text
              style={showCancelButton ? styles.searchButtonText : { height: 0 }}
            >
              Cancel
            </Text>
          </View>
        </TouchableOpacity>
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
  gotoFilter: PropTypes.func.isRequired,
  showSearchButton: PropTypes.bool.isRequired,
  showCancelButton: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  isFilterable: PropTypes.bool.isRequired
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
  gotoFilter: () => {},
  showSearchButton: false,
  showCancelButton: false,
  disabled: false,
  isFilterable: true
};

export default withNavigation(DateAndGuestPicker);
