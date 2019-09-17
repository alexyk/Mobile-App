import React, { Component } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setDatesAndGuestsData } from "../../../redux/action/userInterface";
import PropTypes from "prop-types";
import Toast from "react-native-easy-toast";
import CloseButton from "../../atoms/CloseButton";
import GuestRow from "../../molecules/GuestRow";
import CheckBox from "react-native-checkbox";
import styles from "./styles";
import {
  updateChildAgesCache,
  INVALID_CHILD_AGE,
  modifyChildAgeInRoom,
  modifyChildrenCountInRoom,
  modifyRoomsForChildrenData,
  calculateChildrenCount
} from "./utils";
import Separator from "../../atoms/Separator";
import ChildrenRooms from "../../molecules/ChildrenRooms";
import { HOTEL_ROOM_LIMITS } from "../../../config-settings";
import { cloneDeep } from "lodash";


class Guests extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func
    })
  };

  static defaultProps = {
    navigation: {
      navigate: () => {}
    }
  };

  constructor(props) {
    super(props);

    const { adults, children, childrenAgeValues, rooms } = this.props.datesAndGuestsData;

    this.state = {
      adults,
      children,
      rooms,
      childrenAgeValues: cloneDeep(childrenAgeValues),
      hasChildren: children > 0
    };

    // local cache - to be modified only by:
    //  1) modifyChildrenCountInRoom() for consistency
    //  2) onClear - a private case of cleaning local cache
    this._childAgesCached = cloneDeep(childrenAgeValues);

    this.onClose = this.onClose.bind(this);
    this.onDone = this.onDone.bind(this);
    this.onClear = this.onClear.bind(this);
    this.onCountChange = this.onCountChange.bind(this);
    this.onChildeAgeChange = this.onChildeAgeChange.bind(this);
    this.onWithChildrenClick = this.onWithChildrenClick.bind(this);
  }

  /**
   * Sets the state of type with the updated value of count
   * @param {String} type One of 'rooms', 'adults' or 'children'
   * @param {Number} count
   * @param {Number} roomIndex
   */
  onCountChange(type, count, roomIndex = null) {
    const { childrenAgeValues, rooms } = this.state;
    let cache = this._childAgesCached;

    let newValue = count;
    let extraValues = {};
    let newAgeValues;

    switch (type) {
      case "children":
        // update children count in the room
        newAgeValues = modifyChildrenCountInRoom(
          roomIndex,
          count,
          childrenAgeValues,
          cache
        );
        extraValues = { childrenAgeValues: newAgeValues };

        newValue = calculateChildrenCount(newAgeValues);

        updateChildAgesCache(roomIndex, newAgeValues, cache);
        break;

      case "rooms":
        newAgeValues = modifyRoomsForChildrenData(
          count,
          rooms,
          childrenAgeValues,
          cache
        );
        extraValues = { childrenAgeValues: newAgeValues };
        updateChildAgesCache(null, newAgeValues, cache);
        break;

      case "adults":
        if (newValue < rooms) {
          newAgeValues = modifyRoomsForChildrenData(
            newValue,
            rooms,
            childrenAgeValues,
            cache
          );
          extraValues = { rooms: newValue, childrenAgeValues: newAgeValues };
          updateChildAgesCache(null, newAgeValues, cache);
        }
        break;
    }
    this.setState({ [type]: newValue, ...extraValues });
  }

  onWithChildrenClick(value) {
    const { rooms, childrenAgeValues } = this.state;
    const cache = this._childAgesCached;
    // prettier-ignore
    const newAgeValues = modifyRoomsForChildrenData(rooms, rooms, childrenAgeValues, cache);

    updateChildAgesCache(null, newAgeValues, cache);

    let childrenCount = !value ? calculateChildrenCount(newAgeValues) : 0;

    this.setState({
      hasChildren: !value,
      childrenAgeValues: newAgeValues,
      children: childrenCount
    });
  }

  onChildeAgeChange(age, {roomIndex, childIndex}) {
    const { childrenAgeValues } = this.state;
    const newValues = modifyChildAgeInRoom(
      roomIndex,
      childIndex,
      age,
      childrenAgeValues
    );

    const cache = this._childAgesCached;
    updateChildAgesCache(roomIndex, newValues, cache);

    this.setState({ childrenAgeValues: newValues });
  }

  onClose() {
    this.props.navigation.goBack();
  }

  onDone() {
    const { adults, childrenAgeValues } = this.state;
    const { params } = this.props.navigation.state;
    if (adults === 0) {
      this.refs.toast.show("You cannot book without adult.", 1500);
      return;
    }

    let allChildrenHaveAge = true;
    for (let room of childrenAgeValues) {
      for (let item of room) {
        if (item == INVALID_CHILD_AGE) {
          allChildrenHaveAge = false;
          break;
        }
      }
    }
    if (!allChildrenHaveAge) {
      this.refs.toast.show(
        "Please select the age of each of the children.",
        1500
      );
      return;
    }

    if (params && params.updateData) {
      params.updateData(this.state);
    }
    this.props.navigation.goBack();
  }

  onClear() {
    this._childAgesCached = [[]];
    this.setState({
      childrenAgeValues: [[]],
      adults: 2,
      rooms: 1,
      children: 0,
      hasChildren: false
    });
  }

  _renderChildren(hasChildren, children) {
    const count = (hasChildren
      ? `(${children})` 
      : ""
    );
    return (
      <View
        style={{
          flexDirection: "row",
          alignSelf: 'flex-end',
          alignItems: "center",
          justifyContent: "space-between",
          marginRight: 10
        }}
      >
        <CheckBox
          checked={hasChildren}
          label={`With Children ${count}`}
          labelStyle={styles.withChildrenCheckboxText}
          containerStyle={styles.withChildrenCheckboxContainer}
          checkboxStyle={styles.withChildrenCheckbox}
          onChange={this.onWithChildrenClick}
        />
      </View>
    );
  }

  _renderDoneButton() {
    return (
      <View style={styles.doneButtonContainer}>
        <TouchableOpacity style={styles.doneButtonTouchable} onPress={this.onDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

    )
  }

  _renderClearButton() {
    return (
      <TouchableOpacity
        onPress={this.onClear}
        style={{ marginTop: 40, marginRight: 15 }}
      >
        <Text style={styles.childrenText}>{`Clear`}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { childrenAgeValues, children, adults, rooms, hasChildren } = this.state;
    const maxRooms = Math.min(HOTEL_ROOM_LIMITS.MAX.ROOMS, adults);

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <CloseButton onPress={this.onClose} />
          {this._renderClearButton()}
        </View>
        <Separator height={20} />
        <View style={styles.bodyRows}>
          <GuestRow
            title={"Adults"}
            min={HOTEL_ROOM_LIMITS.MIN.ADULTS}
            max={HOTEL_ROOM_LIMITS.MAX.ADULTS}
            count={adults}
            type={"adults"}
            onChanged={this.onCountChange}
            subtitle={"at least 1 adult per room"}
          />
          <GuestRow
            title={"Rooms"}
            min={HOTEL_ROOM_LIMITS.MIN.ROOMS}
            max={maxRooms}
            count={rooms}
            type={"rooms"}
            onChanged={this.onCountChange}
          />
          { this._renderDoneButton() }
          <Separator isHR height={1} margin={5} />
          {this._renderChildren(hasChildren, children)}
          <ChildrenRooms
            data={{ children, childrenAgeValues, rooms }}
            hasChildren={hasChildren}
            onCountChange={this.onCountChange}
            onChildeAgeChange={this.onChildeAgeChange}
            cache={this._childAgesCached}
          />
        </View>

        <Toast
          ref="toast"
          style={{ backgroundColor: "#DA7B61" }}
          position="bottom"
          positionValue={350}
          fadeInDuration={500}
          fadeOutDuration={500}
          opacity={1.0}
          textStyle={{ color: "white", fontFamily: "FuturaStd-Light" }}
        />
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    datesAndGuestsData: state.userInterface.datesAndGuestsData
  };
};

const mapDispatchToProps = dispatch => ({
  setDatesAndGuestsData: bindActionCreators(setDatesAndGuestsData, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Guests);
